import { upload } from '@vercel/blob/client';

/**
 * 클라이언트에서 Vercel Blob Storage로 직접 파일 업로드
 * @param {File} file - 업로드할 파일
 * @param {string} applicationId - 신청서 ID (파일명에 포함)
 * @param {number} index - 파일 인덱스
 * @returns {Promise<Object>} 업로드된 파일 정보
 */
export async function uploadFileDirectly(file, applicationId, index) {
  try {
    // 파일명 생성 (신청서ID_인덱스_타임스탬프_원본파일명)
    const timestamp = Date.now();
    const filename = `applications/${applicationId}/${timestamp}_${index}_${file.name}`;

    // Vercel Blob에 직접 업로드
    const blob = await upload(filename, file, {
      access: 'public',
      handleUploadUrl: '/api/applications/upload-token',
    });

    return {
      url: blob.url,
      filename: filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      blobId: blob.pathname,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error('클라이언트 업로드 오류:', error);
    throw new Error(`파일 업로드 실패: ${error.message}`);
  }
}

/**
 * 여러 파일을 순차적으로 업로드
 * @param {File[]} files - 업로드할 파일 배열
 * @param {string} applicationId - 신청서 ID
 * @param {Function} onProgress - 진행률 콜백 함수
 * @returns {Promise<Object[]>} 업로드된 파일 정보 배열
 */
export async function uploadMultipleFiles(files, applicationId, onProgress) {
  const uploadedFiles = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      // 진행률 업데이트
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: totalFiles,
          fileName: file.name,
          status: 'uploading',
        });
      }

      const uploadedFile = await uploadFileDirectly(file, applicationId, i);
      uploadedFiles.push(uploadedFile);

      // 진행률 업데이트
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: totalFiles,
          fileName: file.name,
          status: 'completed',
        });
      }
    } catch (error) {
      // 진행률 업데이트 (오류)
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: totalFiles,
          fileName: file.name,
          status: 'error',
          error: error.message,
        });
      }
      throw error;
    }
  }

  return uploadedFiles;
}

/**
 * 파일 개수 검증
 * @param {File[]} files - 검증할 파일 배열
 * @returns {boolean}
 */
export function validateFileCount(files) {
  const maxFiles = 5;

  if (files.length > maxFiles) {
    throw new Error('파일은 최대 5개까지만 업로드 가능합니다.');
  }

  return true;
}

/**
 * 파일 타입 검증
 * @param {File} file - 검증할 파일
 * @returns {boolean}
 */
export function validateFileType(file) {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`지원하지 않는 파일 형식입니다: ${file.type}`);
  }

  return true;
}

/**
 * 파일 크기 검증
 * @param {File} file - 검증할 파일
 * @param {number} maxSize - 최대 크기 (바이트)
 * @returns {boolean}
 */
export function validateFileSize(file, maxSize = 50 * 1024 * 1024) {
  // 기본 50MB
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`);
  }

  return true;
}

/**
 * 모든 파일 검증
 * @param {File[]} files - 검증할 파일 배열
 * @returns {boolean}
 */
export function validateFiles(files) {
  // 파일 개수 검증
  validateFileCount(files);

  // 각 파일 검증
  files.forEach((file) => {
    validateFileType(file);
    validateFileSize(file);
  });

  return true;
}
