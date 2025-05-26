/**
 * 리뷰 이미지 클라이언트 업로드 유틸리티 (Cloudinary)
 */

/**
 * Cloudinary에서 이미지 삭제 (롤백용)
 * @param {string} cloudinaryId - 삭제할 Cloudinary ID
 * @returns {Promise<void>}
 */
async function deleteImageFromCloudinary(cloudinaryId) {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cloudinaryId }),
    });

    if (!response.ok) {
      throw new Error('이미지 삭제 실패');
    }
  } catch (error) {
    console.error('Cloudinary 이미지 삭제 오류:', error);
    throw error;
  }
}

/**
 * 이미지 파일 검증 함수
 * @param {Array} images - 검증할 이미지 배열
 * @returns {boolean}
 */
export function validateImages(images) {
  const maxImages = 5;
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  // 이미지 개수 검증
  if (images.length > maxImages) {
    throw new Error(`이미지는 최대 ${maxImages}장까지만 업로드 가능합니다.`);
  }

  // 각 이미지 검증
  for (const image of images) {
    // 파일 타입 검증
    if (!allowedTypes.includes(image.type)) {
      throw new Error(`지원하지 않는 이미지 형식입니다. (JPG, PNG만 허용) - ${image.name}`);
    }

    // 파일 크기 검증
    if (image.size > maxImageSize) {
      throw new Error(`이미지 크기는 5MB를 초과할 수 없습니다. (${image.name})`);
    }
  }

  return true;
}

/**
 * 단일 이미지를 Cloudinary에 업로드
 * @param {File} image - 업로드할 이미지
 * @param {string} userId - 사용자 ID
 * @param {string} reviewId - 리뷰 ID
 * @param {Function} onProgress - 진행률 콜백 (선택사항)
 * @returns {Promise<Object>} 업로드된 이미지 정보
 */
export async function uploadSingleReviewImage(image, userId, reviewId, onProgress) {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', userId);
    formData.append('reviewId', reviewId);

    // API 호출
    const response = await fetch('/api/reviews/upload-token', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이미지 업로드에 실패했습니다.');
    }

    const result = await response.json();

    if (onProgress) {
      onProgress({
        status: 'completed',
        fileName: image.name,
      });
    }

    return result.image;
  } catch (error) {
    if (onProgress) {
      onProgress({
        status: 'error',
        fileName: image.name,
        error: error.message,
      });
    }
    throw error;
  }
}

/**
 * 여러 이미지를 Cloudinary에 순차 업로드 (롤백 기능 포함)
 * @param {Array} images - 업로드할 이미지 배열
 * @param {string} userId - 사용자 ID
 * @param {string} reviewId - 리뷰 ID
 * @param {Function} onProgress - 진행률 콜백
 * @returns {Promise<Array>} 업로드된 이미지 정보 배열
 */
export async function uploadMultipleReviewImages(images, userId, reviewId, onProgress) {
  const uploadedImages = [];

  try {
    // 이미지 검증
    validateImages(images);

    const total = images.length;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const current = i + 1;

      // 진행률 업데이트
      if (onProgress) {
        onProgress({
          current,
          total,
          fileName: image.name,
          status: 'uploading',
          percentage: Math.round((current / total) * 100),
        });
      }

      try {
        // 이미지 업로드
        const uploadedImage = await uploadSingleReviewImage(image, userId, reviewId, onProgress);
        uploadedImages.push(uploadedImage);

        // 업로드 간 짧은 지연 (서버 부하 방지)
        if (i < images.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (uploadError) {
        console.error(`이미지 ${i + 1} 업로드 실패:`, uploadError);

        // 이미 업로드된 이미지들 롤백
        if (uploadedImages.length > 0) {
          console.log('업로드 실패, 이미 업로드된 이미지들 롤백 시작...');
          await rollbackUploadedImages(uploadedImages);
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

    return uploadedImages;
  } catch (error) {
    console.error('다중 이미지 업로드 오류:', error);

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
 * 업로드된 이미지들을 Cloudinary에서 삭제 (롤백)
 * @param {Array} uploadedImages - 삭제할 이미지 정보 배열
 * @returns {Promise<void>}
 */
async function rollbackUploadedImages(uploadedImages) {
  try {
    const deletePromises = uploadedImages
      .filter((img) => img.cloudinaryId)
      .map((img) => deleteImageFromCloudinary(img.cloudinaryId));

    await Promise.allSettled(deletePromises);
    console.log('이미지 롤백 완료');
  } catch (error) {
    console.error('이미지 롤백 중 오류:', error);
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
