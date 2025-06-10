import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from './cloudinary.js';

//리뷰관련 이미지 처리 파일
/**
 * 리뷰 이미지를 Cloudinary에 업로드
 * @param {File|Buffer} image - 업로드할 이미지
 * @param {string} userId - 사용자 ID
 * @param {string} reviewId - 리뷰 ID
 * @param {string} originalName - 원본 파일명
 * @returns {Promise<Object>} 업로드된 이미지 정보
 */
export async function uploadImageToCloudinary(image, userId, reviewId, originalName) {
  try {
    // 이미지 파일 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    let mimeType;

    if (image instanceof File) {
      mimeType = image.type;
      if (!allowedTypes.includes(mimeType)) {
        throw new Error('지원하지 않는 이미지 형식입니다. (JPG, PNG만 허용)');
      }
    }

    // File 객체인 경우 Buffer로 변환
    let imageBuffer;
    if (image instanceof File) {
      const arrayBuffer = await image.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(image)) {
      imageBuffer = image;
    } else {
      throw new Error('지원하지 않는 파일 형식입니다.');
    }

    const result = await uploadToCloudinary(imageBuffer, userId, reviewId, originalName, 'reviews');

    return {
      url: result.url,
      filename: result.filename,
      originalName: result.originalName,
      mimeType: result.mimeType,
      size: result.size,
      cloudinaryId: result.cloudinaryId,
      uploadedAt: result.uploadedAt,
    };
  } catch (error) {
    console.error('리뷰 이미지 업로드 오류:', error);
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }
}

/**
 * Cloudinary에서 이미지 삭제
 * @param {string} cloudinaryId - Cloudinary public_id
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteImageFromCloudinary(cloudinaryId) {
  try {
    const result = await deleteFromCloudinary(cloudinaryId);
    return result;
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    throw new Error(`이미지 삭제 실패: ${error.message}`);
  }
}

/**
 * Cloudinary에서 여러 이미지 삭제
 * @param {string[]} cloudinaryIds - Cloudinary public_id 배열
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteMultipleImagesFromCloudinary(cloudinaryIds) {
  try {
    const result = await deleteMultipleFromCloudinary(cloudinaryIds);
    return result;
  } catch (error) {
    console.error('다중 이미지 삭제 오류:', error);
    throw new Error(`이미지 삭제 실패: ${error.message}`);
  }
}

/**
 * 리뷰의 모든 이미지를 Cloudinary에서 삭제 (순차 처리로 최적화)
 * @param {Array} images - 삭제할 이미지 배열
 * @returns {Promise<void>}
 */
export async function deleteReviewImagesFromCloudinary(images) {
  try {
    // 병렬 처리 대신 순차 처리로 변경하여 rate limiting 방지
    for (const image of images) {
      if (image.cloudinaryId) {
        await deleteImageFromCloudinary(image.cloudinaryId);
        // 각 삭제 사이에 작은 지연 추가 (선택적)
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    console.error('리뷰 이미지 일괄 삭제 오류:', error);
    throw new Error(`리뷰 이미지 삭제 실패: ${error.message}`);
  }
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
