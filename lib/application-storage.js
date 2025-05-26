import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  forceDeleteFromCloudinary,
} from './cloudinary.js';

/**
 * 신청서 파일을 Cloudinary에 업로드
 * @param {File|Buffer} file - 업로드할 파일
 * @param {string} userId - 사용자 ID
 * @param {string} applicationId - 신청서 ID
 * @param {string} originalName - 원본 파일명
 * @returns {Promise<Object>} 업로드된 파일 정보
 */
export async function uploadFileToCloudinary(file, userId, applicationId, originalName) {
  try {
    // File 객체인 경우 Buffer로 변환
    let fileBuffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else {
      throw new Error('지원하지 않는 파일 형식입니다.');
    }

    const result = await uploadToCloudinary(
      fileBuffer,
      userId,
      applicationId,
      originalName,
      'applications'
    );

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
    console.error('신청서 파일 업로드 오류:', error);
    throw new Error(`파일 업로드 실패: ${error.message}`);
  }
}

/**
 * 신청서 이미지를 Cloudinary에 업로드
 * @param {File|Buffer} image - 업로드할 이미지
 * @param {string} userId - 사용자 ID
 * @param {string} applicationId - 신청서 ID
 * @param {string} originalName - 원본 파일명
 * @returns {Promise<Object>} 업로드된 이미지 정보
 */
export async function uploadImageToCloudinary(image, userId, applicationId, originalName) {
  try {
    // 이미지 파일 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
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

    const result = await uploadToCloudinary(
      imageBuffer,
      userId,
      applicationId,
      originalName,
      'applications'
    );

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
    console.error('신청서 이미지 업로드 오류:', error);
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }
}

/**
 * Cloudinary에서 파일 삭제 (강력한 삭제 포함)
 * @param {string} cloudinaryId - Cloudinary public_id
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteFileFromCloudinary(cloudinaryId) {
  try {
    // 먼저 일반 삭제 시도
    const result = await deleteFromCloudinary(cloudinaryId);

    // 일반 삭제가 실패하면 강제 삭제 시도
    if (result.result !== 'ok') {
      console.log(`일반 삭제 실패, 강제 삭제 시도: ${cloudinaryId}`);
      const forceResult = await forceDeleteFromCloudinary(cloudinaryId);
      return forceResult;
    }

    return result;
  } catch (error) {
    console.error('파일 삭제 오류:', error);

    // 마지막 시도: 강제 삭제
    try {
      console.log(`오류 발생, 강제 삭제 최종 시도: ${cloudinaryId}`);
      const forceResult = await forceDeleteFromCloudinary(cloudinaryId);
      return forceResult;
    } catch (forceError) {
      console.error('강제 삭제도 실패:', forceError);
      throw new Error(`파일 삭제 실패: ${error.message}`);
    }
  }
}

/**
 * Cloudinary에서 여러 파일 삭제 (강력한 삭제 포함)
 * @param {string[]} cloudinaryIds - Cloudinary public_id 배열
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteMultipleFilesFromCloudinary(cloudinaryIds) {
  try {
    // 먼저 일반 다중 삭제 시도
    const result = await deleteMultipleFromCloudinary(cloudinaryIds);

    // 삭제되지 않은 파일들 확인
    const deletedIds = Object.keys(result.deleted || {});
    const failedIds = cloudinaryIds.filter((id) => !deletedIds.includes(id));

    // 실패한 파일들을 개별적으로 강제 삭제 시도
    if (failedIds.length > 0) {
      console.log(`${failedIds.length}개 파일 개별 강제 삭제 시도...`);

      for (const failedId of failedIds) {
        try {
          const forceResult = await forceDeleteFromCloudinary(failedId);
          if (forceResult.result === 'ok') {
            result.deleted[failedId] = 'deleted';
            if (!result.deleted_counts) result.deleted_counts = {};
            result.deleted_counts[failedId] = 1;
          }
        } catch (forceError) {
          console.error(`강제 삭제 실패 (${failedId}):`, forceError.message);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('다중 파일 삭제 오류:', error);

    // 전체 실패 시 개별 강제 삭제 시도
    console.log('다중 삭제 실패, 모든 파일을 개별 강제 삭제 시도...');
    const results = { deleted: {}, deleted_counts: {} };

    for (const cloudinaryId of cloudinaryIds) {
      try {
        const forceResult = await forceDeleteFromCloudinary(cloudinaryId);
        if (forceResult.result === 'ok') {
          results.deleted[cloudinaryId] = 'deleted';
          results.deleted_counts[cloudinaryId] = 1;
        }
      } catch (forceError) {
        console.error(`개별 강제 삭제 실패 (${cloudinaryId}):`, forceError.message);
      }
    }

    return results;
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
