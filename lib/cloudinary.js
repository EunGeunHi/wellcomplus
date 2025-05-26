import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 파일을 Cloudinary에 업로드
 * @param {Buffer|string} file - 업로드할 파일 (Buffer 또는 base64 문자열)
 * @param {string} userId - 사용자 ID (폴더 구조용)
 * @param {string} applicationId - 신청서 ID (폴더 구조용)
 * @param {string} originalName - 원본 파일명
 * @param {string} folder - 폴더 타입 ('applications' 또는 'reviews')
 * @returns {Promise<Object>} 업로드 결과
 */
export async function uploadToCloudinary(
  file,
  userId,
  applicationId,
  originalName,
  folder = 'applications'
) {
  try {
    // 폴더 구조: applications/userId/applicationId/ 또는 reviews/userId/reviewId/
    const folderPath = `${folder}/${userId}/${applicationId}`;

    // 파일명에서 확장자 추출
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const publicId = `${timestamp}_${originalName.replace(/\.[^/.]+$/, '')}`;

    const uploadOptions = {
      folder: folderPath,
      public_id: publicId,
      resource_type: 'auto', // 자동으로 파일 타입 감지
      format: fileExtension,
      overwrite: false,
      unique_filename: true,
      use_filename: true,
    };

    let uploadResult;

    // Buffer인 경우
    if (Buffer.isBuffer(file)) {
      uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(file);
      });
    }
    // base64 문자열인 경우
    else if (typeof file === 'string') {
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      throw new Error('지원하지 않는 파일 형식입니다.');
    }

    // mimeType 정확한 감지 및 정규화
    let normalizedMimeType;
    const ext = fileExtension.toLowerCase();

    // 이미지 파일
    if (['jpg', 'jpeg'].includes(ext)) {
      normalizedMimeType = 'image/jpeg';
    } else if (ext === 'png') {
      normalizedMimeType = 'image/png';
    } else if (ext === 'gif') {
      normalizedMimeType = 'image/gif';
    } else if (ext === 'webp') {
      normalizedMimeType = 'image/webp';
    }
    // 문서 파일
    else if (ext === 'pdf') {
      normalizedMimeType = 'application/pdf';
    } else if (['doc', 'docx'].includes(ext)) {
      normalizedMimeType = 'application/msword';
    } else if (['xls', 'xlsx'].includes(ext)) {
      normalizedMimeType = 'application/vnd.ms-excel';
    } else if (['ppt', 'pptx'].includes(ext)) {
      normalizedMimeType = 'application/vnd.ms-powerpoint';
    }
    // 압축 파일
    else if (ext === 'zip') {
      normalizedMimeType = 'application/zip';
    } else if (ext === 'rar') {
      normalizedMimeType = 'application/x-rar-compressed';
    } else if (ext === '7z') {
      normalizedMimeType = 'application/x-7z-compressed';
    }
    // 기타 파일
    else if (ext === 'txt') {
      normalizedMimeType = 'text/plain';
    } else if (ext === 'torrent') {
      normalizedMimeType = 'application/x-bittorrent';
    } else {
      // 기본값: 확장자 기반으로 추정
      normalizedMimeType = `application/${ext}`;
    }

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      filename: `${publicId}.${fileExtension}`,
      originalName: originalName,
      mimeType: normalizedMimeType,
      size: uploadResult.bytes,
      cloudinaryId: uploadResult.public_id,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error('Cloudinary 업로드 오류:', error);
    throw new Error(`파일 업로드 실패: ${error.message}`);
  }
}

/**
 * Cloudinary에서 파일 삭제 (모든 파일 타입 지원)
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteFromCloudinary(publicId) {
  try {
    // 모든 가능한 resource_type으로 삭제 시도
    const resourceTypes = ['image', 'raw', 'video', 'auto'];
    let lastResult = null;
    let deleteSuccess = false;

    for (const resourceType of resourceTypes) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
          invalidate: true, // 캐시도 무효화
        });

        lastResult = result;

        // 삭제 성공 시 (ok 또는 not found가 아닌 경우)
        if (result.result === 'ok') {
          deleteSuccess = true;
          console.log(`파일 삭제 성공 (${resourceType}):`, publicId);
          break;
        }
      } catch (error) {
        // 특정 resource_type에서 오류가 발생해도 다음 타입 시도
        console.warn(`${resourceType} 타입으로 삭제 시도 중 오류:`, error.message);
        continue;
      }
    }

    // Admin API를 사용한 강제 삭제 시도 (마지막 수단)
    if (!deleteSuccess) {
      try {
        console.log('일반 삭제 실패, Admin API로 강제 삭제 시도:', publicId);
        const adminResult = await cloudinary.api.delete_resources([publicId], {
          resource_type: 'raw',
          type: 'upload',
        });

        if (adminResult.deleted && adminResult.deleted[publicId]) {
          lastResult = { result: 'ok', publicId };
          deleteSuccess = true;
          console.log('Admin API로 삭제 성공:', publicId);
        }
      } catch (adminError) {
        console.warn('Admin API 삭제도 실패:', adminError.message);
      }
    }

    // 최종 결과 반환
    return lastResult || { result: 'not found', publicId };
  } catch (error) {
    console.error('Cloudinary 삭제 오류:', error);
    throw new Error(`파일 삭제 실패: ${error.message}`);
  }
}

/**
 * 여러 파일을 Cloudinary에서 삭제 (모든 파일 타입 지원)
 * @param {string[]} publicIds - Cloudinary public_id 배열
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteMultipleFromCloudinary(publicIds) {
  try {
    const results = {
      deleted: {},
      deleted_counts: {},
      partial: false,
      rate_limit_allowed: 0,
      rate_limit_reset_at: null,
      rate_limit_remaining: 0,
    };

    let remainingIds = [...publicIds]; // 복사본 생성

    // 각 파일 타입별로 삭제 시도
    const resourceTypes = ['image', 'raw', 'video', 'auto'];

    for (const resourceType of resourceTypes) {
      if (remainingIds.length === 0) break;

      try {
        const result = await cloudinary.api.delete_resources(remainingIds, {
          resource_type: resourceType,
          invalidate: true, // 캐시도 무효화
        });

        // 결과 병합
        if (result.deleted) {
          Object.assign(results.deleted, result.deleted);
        }
        if (result.deleted_counts) {
          Object.assign(results.deleted_counts, result.deleted_counts);
        }

        // 삭제된 파일들은 다음 타입에서 제외
        const deletedIds = Object.keys(result.deleted || {});
        remainingIds = remainingIds.filter((id) => !deletedIds.includes(id));

        console.log(`${resourceType} 타입으로 ${deletedIds.length}개 파일 삭제 완료`);
      } catch (error) {
        // 특정 resource_type에서 오류가 발생해도 다음 타입 시도
        console.warn(`${resourceType} 타입 삭제 중 오류:`, error.message);
      }
    }

    // 여전히 삭제되지 않은 파일들을 개별적으로 강제 삭제 시도
    if (remainingIds.length > 0) {
      console.log(`${remainingIds.length}개 파일이 남아있음, 개별 삭제 시도...`);

      for (const publicId of remainingIds) {
        try {
          // 개별 파일 삭제 함수 사용 (더 강력한 삭제 로직 포함)
          const individualResult = await deleteFromCloudinary(publicId);

          if (individualResult.result === 'ok') {
            results.deleted[publicId] = 'deleted';
            if (!results.deleted_counts) results.deleted_counts = {};
            results.deleted_counts[publicId] = 1;
          }
        } catch (error) {
          console.warn(`개별 삭제 실패 (${publicId}):`, error.message);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Cloudinary 다중 삭제 오류:', error);
    throw new Error(`파일 삭제 실패: ${error.message}`);
  }
}

/**
 * 이미지 URL 최적화 (리사이징, 압축 등)
 * @param {string} publicId - Cloudinary public_id
 * @param {Object} options - 변환 옵션
 * @returns {string} 최적화된 URL
 */
export function getOptimizedImageUrl(publicId, options = {}) {
  const { width = 800, height = 600, crop = 'fill', quality = 'auto', format = 'auto' } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true,
  });
}

/**
 * 강제 파일 삭제 (모든 방법 시도)
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>} 삭제 결과
 */
export async function forceDeleteFromCloudinary(publicId) {
  try {
    console.log(`강제 삭제 시작: ${publicId}`);

    // 1단계: 일반 삭제 시도
    const normalResult = await deleteFromCloudinary(publicId);
    if (normalResult.result === 'ok') {
      console.log(`일반 삭제 성공: ${publicId}`);
      return normalResult;
    }

    // 2단계: 모든 타입과 upload_preset으로 시도
    const allTypes = ['image', 'raw', 'video', 'auto'];
    const allUploadTypes = ['upload', 'private', 'authenticated'];

    for (const resourceType of allTypes) {
      for (const uploadType of allUploadTypes) {
        try {
          const result = await cloudinary.api.delete_resources([publicId], {
            resource_type: resourceType,
            type: uploadType,
            invalidate: true,
          });

          if (result.deleted && result.deleted[publicId]) {
            console.log(`강제 삭제 성공 (${resourceType}/${uploadType}): ${publicId}`);
            return { result: 'ok', publicId, method: `${resourceType}/${uploadType}` };
          }
        } catch (error) {
          // 계속 시도
          continue;
        }
      }
    }

    // 3단계: 폴더 기반 삭제 시도 (폴더 구조를 알고 있는 경우)
    try {
      // publicId에서 폴더 경로 추출
      const pathParts = publicId.split('/');
      if (pathParts.length >= 3) {
        const folder = pathParts.slice(0, -1).join('/');
        console.log(`폴더 기반 삭제 시도: ${folder}`);

        const folderResult = await cloudinary.api.delete_resources_by_prefix(publicId, {
          resource_type: 'raw',
          invalidate: true,
        });

        if (folderResult.deleted && Object.keys(folderResult.deleted).length > 0) {
          console.log(`폴더 기반 삭제 성공: ${publicId}`);
          return { result: 'ok', publicId, method: 'folder-based' };
        }
      }
    } catch (error) {
      console.warn('폴더 기반 삭제 실패:', error.message);
    }

    console.warn(`모든 삭제 방법 실패: ${publicId}`);
    return { result: 'not found', publicId, error: 'All deletion methods failed' };
  } catch (error) {
    console.error(`강제 삭제 오류 (${publicId}):`, error);
    throw new Error(`강제 삭제 실패: ${error.message}`);
  }
}

export default cloudinary;
