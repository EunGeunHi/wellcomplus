import { put, del, list } from '@vercel/blob';

/**
 * 파일을 Vercel Blob Storage에 업로드
 * @param {File} file - 업로드할 파일
 * @param {string} userId - 사용자 ID
 * @param {string} applicationId - 신청서 ID
 * @param {number} index - 파일 인덱스
 * @returns {Promise<Object>} 업로드된 파일 정보
 */
export async function uploadFileToBlob(file, userId, applicationId, index) {
  try {
    // 파일명 생성 (유저ID/신청서ID_인덱스_타임스탬프_원본파일명)
    const timestamp = Date.now();
    const filename = `applications/${userId}/${applicationId}/${timestamp}_${index}_${file.name}`;

    // Vercel Blob에 파일 업로드
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return {
      url: blob.url,
      filename: filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      blobId: blob.pathname, // Blob Storage에서의 고유 식별자
    };
  } catch (error) {
    console.error('Blob 업로드 오류:', error);
    throw new Error(`파일 업로드 실패: ${error.message}`);
  }
}

/**
 * Vercel Blob Storage에서 파일 삭제
 * @param {string} url - 삭제할 파일의 URL
 * @returns {Promise<void>}
 */
export async function deleteFileFromBlob(url) {
  try {
    await del(url);
  } catch (error) {
    console.error('Blob 삭제 오류:', error);
    throw new Error(`파일 삭제 실패: ${error.message}`);
  }
}

/**
 * 신청서의 모든 파일을 Blob Storage에서 삭제
 * @param {Array} files - 삭제할 파일 배열
 * @returns {Promise<void>}
 */
export async function deleteApplicationFilesFromBlob(files) {
  try {
    const deletePromises = files.map((file) => {
      if (file.url) {
        return deleteFileFromBlob(file.url);
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('신청서 파일 일괄 삭제 오류:', error);
    throw new Error(`신청서 파일 삭제 실패: ${error.message}`);
  }
}

/**
 * 파일 개수 검증
 * @param {Array} files - 검증할 파일 배열
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
 * 파일 타입 검증 (선택적)
 * @param {File} file - 검증할 파일
 * @returns {boolean}
 */
export function validateFileType(file) {
  // 모든 파일 타입 허용 (필요시 제한 추가)
  return true;
}
