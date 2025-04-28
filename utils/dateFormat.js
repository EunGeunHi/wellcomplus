/**
 * 날짜 문자열을 한국 형식으로 포맷팅하는 유틸리티 함수들
 */

/**
 * ISO 형식의 날짜 문자열을 한국 날짜 형식(YYYY년 MM월 DD일)으로 변환
 * @param {string} dateString - 변환할 날짜 문자열 (ISO 형식: YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param {Object} options - 포맷 옵션
 * @param {boolean} options.withTime - 시간 포함 여부 (기본값: false)
 * @param {boolean} options.shortFormat - 짧은 형식 사용 여부 (기본값: false, ex: 2023.05.21)
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';

  const { withTime = false, shortFormat = false } = options;

  try {
    const date = new Date(dateString);

    // 날짜가 유효하지 않은 경우
    if (isNaN(date.getTime())) {
      return '';
    }

    // 한국 시간대 적용
    const koreaOptions = {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: shortFormat ? '2-digit' : 'long',
      day: 'numeric',
      hour: withTime ? '2-digit' : undefined,
      minute: withTime ? '2-digit' : undefined,
      hour12: true,
    };

    // 짧은 형식 처리 ('2023.05.21' 형식)
    if (shortFormat) {
      const formatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      return formatter.format(date).replace(/\s+/g, '').replace(/\.$/g, '');
    }

    // 기본 형식 ('2023년 5월 21일' 또는 '2023년 5월 21일 오후 3:30' 형식)
    return new Intl.DateTimeFormat('ko-KR', koreaOptions).format(date);
  } catch (error) {
    console.error('날짜 포맷 에러:', error);
    return '';
  }
}

/**
 * ISO 형식의 날짜 문자열로부터 시간만 추출해 포맷팅 (오전/오후 HH:MM 형식)
 * @param {string} dateString - 변환할 날짜 문자열 (ISO 형식)
 * @returns {string} 포맷된 시간 문자열
 */
export function formatTime(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // 날짜가 유효하지 않은 경우
    if (isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('시간 포맷 에러:', error);
    return '';
  }
}

/**
 * 상대적 시간 표시 (예: '3일 전', '방금 전', '1시간 전' 등)
 * @param {string} dateString - 변환할 날짜 문자열 (ISO 형식)
 * @returns {string} 상대적 시간 문자열
 */
export function getRelativeTime(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // 날짜가 유효하지 않은 경우
    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    // 1분 미만
    if (diffInSeconds < 60) {
      return '방금 전';
    }

    // 1시간 미만
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }

    // 1일 미만
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }

    // 30일 미만
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}일 전`;
    }

    // 1년 미만
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}개월 전`;
    }

    // 1년 이상
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}년 전`;
  } catch (error) {
    console.error('상대 시간 계산 에러:', error);
    return '';
  }
}

export default {
  formatDate,
  formatTime,
  getRelativeTime,
};
