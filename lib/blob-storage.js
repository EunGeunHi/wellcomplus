import { put, del, list } from '@vercel/blob';
//리뷰관련 이미지 처리 파일
/**
 * 이미지 파일을 Vercel Blob Storage에 업로드
 * @param {File} file - 업로드할 파일
 * @param {string} reviewId - 리뷰 ID
 * @param {number} index - 이미지 인덱스
 * @returns {Promise<Object>} 업로드된 파일 정보
 */
export async function uploadImageToBlob(file, reviewId, index) {
  try {
    // 파일명 생성 (리뷰ID_인덱스_타임스탬프_원본파일명)
    const timestamp = Date.now();
    const filename = `reviews/${reviewId}/${timestamp}_${index}_${file.name}`;

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
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }
}

/**
 * Vercel Blob Storage에서 이미지 삭제
 * @param {string} url - 삭제할 파일의 URL
 * @returns {Promise<void>}
 */
export async function deleteImageFromBlob(url) {
  try {
    await del(url);
  } catch (error) {
    console.error('Blob 삭제 오류:', error);
    throw new Error(`이미지 삭제 실패: ${error.message}`);
  }
}

/**
 * 리뷰의 모든 이미지를 Blob Storage에서 삭제
 * @param {Array} images - 삭제할 이미지 배열
 * @returns {Promise<void>}
 */
export async function deleteReviewImagesFromBlob(images) {
  try {
    const deletePromises = images.map((image) => {
      if (image.url) {
        return deleteImageFromBlob(image.url);
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('리뷰 이미지 일괄 삭제 오류:', error);
    throw new Error(`리뷰 이미지 삭제 실패: ${error.message}`);
  }
}

/**
 * 이미지 파일 검증
 * @param {File} file - 검증할 파일
 * @returns {boolean}
 */
export function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/png'];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('JPG, PNG 파일만 업로드 가능합니다.');
  }

  return true;
}

/**
 * 여러 이미지 파일들의 총 크기 검증 (더 이상 사용하지 않음)
 * @param {Array} files - 검증할 파일 배열
 * @returns {boolean}
 */
export function validateTotalImageSize(files) {
  // 총 크기 제한 제거됨 - 최대 5장 제한만 유지
  return true;
}

/**
 * 이미지 개수 검증
 * @param {Array} files - 검증할 파일 배열
 * @returns {boolean}
 */
export function validateImageCount(files) {
  const maxImages = 5;

  if (files.length > maxImages) {
    throw new Error('이미지는 최대 5장까지만 업로드 가능합니다.');
  }

  return true;
}
