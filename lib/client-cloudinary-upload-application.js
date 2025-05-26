/**
 * 신청서 파일 클라이언트 업로드 유틸리티 (Cloudinary)
 */

/**
 * Cloudinary에서 파일 삭제 (롤백용 - 강력한 삭제 포함)
 * @param {string} cloudinaryId - 삭제할 Cloudinary ID
 * @returns {Promise<void>}
 */
async function deleteFileFromCloudinary(cloudinaryId) {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cloudinaryId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '파일 삭제 실패');
    }

    const result = await response.json();
    console.log(`파일 삭제 성공: ${cloudinaryId}`, result);
  } catch (error) {
    console.error('Cloudinary 파일 삭제 오류:', error);
    // 클라이언트에서는 API를 통해서만 삭제하므로 에러를 다시 던짐
    throw error;
  }
}

/**
 * 파일 검증 함수
 * @param {Array} files - 검증할 파일 배열
 * @returns {boolean}
 */
export function validateFiles(files) {
  const maxFiles = 5;
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // 파일 개수 검증
  if (files.length > maxFiles) {
    throw new Error(`파일은 최대 ${maxFiles}개까지만 업로드 가능합니다.`);
  }

  // 각 파일 크기 검증
  for (const file of files) {
    if (file.size > maxFileSize) {
      throw new Error(`파일 크기는 10MB를 초과할 수 없습니다. (${file.name})`);
    }
  }

  return true;
}

/**
 * 단일 파일을 Cloudinary에 업로드
 * @param {File} file - 업로드할 파일
 * @param {string} userId - 사용자 ID
 * @param {string} applicationId - 신청서 ID
 * @param {Function} onProgress - 진행률 콜백 (선택사항)
 * @returns {Promise<Object>} 업로드된 파일 정보
 */
export async function uploadSingleFile(file, userId, applicationId, onProgress) {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('applicationId', applicationId);

    // API 호출
    const response = await fetch('/api/applications/upload-token', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '파일 업로드에 실패했습니다.');
    }

    const result = await response.json();

    if (onProgress) {
      onProgress({
        status: 'completed',
        fileName: file.name,
      });
    }

    return result.file;
  } catch (error) {
    if (onProgress) {
      onProgress({
        status: 'error',
        fileName: file.name,
        error: error.message,
      });
    }
    throw error;
  }
}

/**
 * 여러 파일을 Cloudinary에 순차 업로드 (롤백 기능 포함)
 * @param {Array} files - 업로드할 파일 배열
 * @param {string} userId - 사용자 ID
 * @param {string} applicationId - 신청서 ID
 * @param {Function} onProgress - 진행률 콜백
 * @returns {Promise<Array>} 업로드된 파일 정보 배열
 */
export async function uploadMultipleFiles(files, userId, applicationId, onProgress) {
  const uploadedFiles = [];

  try {
    // 파일 검증
    validateFiles(files);

    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const current = i + 1;

      // 진행률 업데이트
      if (onProgress) {
        onProgress({
          current,
          total,
          fileName: file.name,
          status: 'uploading',
          percentage: Math.round((current / total) * 100),
        });
      }

      try {
        // 파일 업로드
        const uploadedFile = await uploadSingleFile(file, userId, applicationId, onProgress);
        uploadedFiles.push(uploadedFile);

        // 업로드 간 짧은 지연 (서버 부하 방지)
        if (i < files.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (uploadError) {
        console.error(`파일 ${i + 1} 업로드 실패:`, uploadError);

        // 이미 업로드된 파일들 롤백
        if (uploadedFiles.length > 0) {
          console.log('업로드 실패, 이미 업로드된 파일들 롤백 시작...');
          await rollbackUploadedFiles(uploadedFiles);
        }

        throw uploadError;
      }
    }

    // 완료 상태 업데이트
    if (onProgress) {
      onProgress({
        current: total,
        total,
        status: 'completed',
        percentage: 100,
      });
    }

    return uploadedFiles;
  } catch (error) {
    console.error('다중 파일 업로드 오류:', error);

    if (onProgress) {
      onProgress({
        status: 'error',
        error: error.message,
      });
    }

    throw error;
  }
}

/**
 * 업로드된 파일들을 Cloudinary에서 삭제 (롤백)
 * @param {Array} uploadedFiles - 삭제할 파일 정보 배열
 * @returns {Promise<void>}
 */
async function rollbackUploadedFiles(uploadedFiles) {
  try {
    const deletePromises = uploadedFiles
      .filter((file) => file.cloudinaryId)
      .map((file) => deleteFileFromCloudinary(file.cloudinaryId));

    await Promise.allSettled(deletePromises);
    console.log('파일 롤백 완료');
  } catch (error) {
    console.error('파일 롤백 중 오류:', error);
    // 롤백 실패는 로그만 남김
  }
}

/**
 * 파일 크기를 읽기 쉬운 형태로 포맷
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷된 크기 문자열
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
