/**
 * Vercel Blob Storage Advanced Operations 최적화 유틸리티
 * 사용량을 줄이고 비용을 절약하기 위한 최적화 함수들
 */

/**
 * 파일 크기 기반 업로드 전략 결정
 * @param {File} file - 업로드할 파일
 * @returns {Object} 최적화된 업로드 설정
 */
export function getOptimizedUploadStrategy(file) {
  const fileSize = file.size;
  const fileSizeMB = fileSize / (1024 * 1024);

  // 파일 크기에 따른 최적화 전략
  if (fileSizeMB < 1) {
    // 1MB 미만: 단일 업로드
    return {
      useMultipart: false,
      chunkSize: null,
      retryAttempts: 2,
    };
  } else if (fileSizeMB < 10) {
    // 1-10MB: 작은 청크 사이즈
    return {
      useMultipart: true,
      chunkSize: 5 * 1024 * 1024, // 5MB
      retryAttempts: 3,
    };
  } else {
    // 10MB 이상: 큰 청크 사이즈
    return {
      useMultipart: true,
      chunkSize: 10 * 1024 * 1024, // 10MB
      retryAttempts: 3,
    };
  }
}

/**
 * 업로드 재시도 로직 (exponential backoff)
 * @param {Function} uploadFunction - 업로드 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @returns {Promise} 업로드 결과
 */
export async function retryUpload(uploadFunction, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFunction();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 2^attempt * 1000ms
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.warn(`업로드 재시도 ${attempt}/${maxRetries}, ${delay}ms 후 재시도`);
    }
  }

  throw lastError;
}

/**
 * 파일 삭제 배치 처리 (순차 실행으로 rate limiting 방지)
 * @param {Array} urls - 삭제할 파일 URL 배열
 * @param {Function} deleteFunction - 삭제 함수
 * @param {number} batchSize - 배치 크기
 * @param {number} delayMs - 배치 간 지연 시간
 */
export async function batchDelete(urls, deleteFunction, batchSize = 5, delayMs = 500) {
  const results = [];

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    // 배치 내에서는 순차 처리
    for (const url of batch) {
      try {
        await deleteFunction(url);
        results.push({ url, success: true });

        // 각 삭제 사이에 작은 지연
        if (batch.indexOf(url) < batch.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`파일 삭제 실패: ${url}`, error);
        results.push({ url, success: false, error: error.message });
      }
    }

    // 배치 간 지연
    if (i + batchSize < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * 파일 중복 체크 (동일한 파일의 중복 업로드 방지)
 * @param {File} file - 체크할 파일
 * @param {Array} existingFiles - 기존 파일 목록
 * @returns {boolean} 중복 여부
 */
export function isDuplicateFile(file, existingFiles = []) {
  return existingFiles.some(
    (existingFile) =>
      existingFile.originalName === file.name &&
      existingFile.size === file.size &&
      existingFile.mimeType === file.type
  );
}

/**
 * 파일 압축 권장 사항 체크
 * @param {File} file - 체크할 파일
 * @returns {Object} 압축 권장 정보
 */
export function getCompressionRecommendation(file) {
  const fileSizeMB = file.size / (1024 * 1024);
  const fileType = file.type;

  const recommendations = {
    shouldCompress: false,
    reason: '',
    estimatedSavings: 0,
  };

  if (fileType.startsWith('image/')) {
    if (fileSizeMB > 2) {
      recommendations.shouldCompress = true;
      recommendations.reason = '이미지 파일이 2MB를 초과합니다. 압축을 권장합니다.';
      recommendations.estimatedSavings = Math.round(fileSizeMB * 0.3 * 100) / 100; // 30% 절약 예상
    }
  } else if (fileType === 'application/pdf') {
    if (fileSizeMB > 5) {
      recommendations.shouldCompress = true;
      recommendations.reason = 'PDF 파일이 5MB를 초과합니다. 압축을 권장합니다.';
      recommendations.estimatedSavings = Math.round(fileSizeMB * 0.2 * 100) / 100; // 20% 절약 예상
    }
  }

  return recommendations;
}

/**
 * Advanced Operations 사용량 추적
 */
export class BlobOperationsTracker {
  constructor() {
    this.operations = {
      put: 0,
      del: 0,
      list: 0,
      head: 0,
    };
    this.startTime = Date.now();
  }

  track(operation) {
    if (this.operations.hasOwnProperty(operation)) {
      this.operations[operation]++;
    }
  }

  getStats() {
    const duration = Date.now() - this.startTime;
    const totalAdvancedOps = this.operations.put + this.operations.del + this.operations.list;

    return {
      duration: Math.round(duration / 1000), // 초 단위
      operations: { ...this.operations },
      totalAdvancedOps,
      estimatedCost: this.calculateEstimatedCost(totalAdvancedOps),
    };
  }

  calculateEstimatedCost(totalOps) {
    const freeLimit = 10000; // Pro 플랜 무료 한도
    const pricePerMillion = 5.0;

    if (totalOps <= freeLimit) {
      return 0;
    }

    const billableOps = totalOps - freeLimit;
    return (billableOps / 1000000) * pricePerMillion;
  }

  reset() {
    this.operations = { put: 0, del: 0, list: 0, head: 0 };
    this.startTime = Date.now();
  }
}

// 전역 트래커 인스턴스
export const globalTracker = new BlobOperationsTracker();
