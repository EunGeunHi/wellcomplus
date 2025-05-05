/**
 * 한국 전화번호 형식 적용 함수 (02 또는 010으로 시작)
 * 지역번호(02)는 02-XXX-XXXX 또는 02-XXXX-XXXX 형식
 * 휴대폰(010)은 010-XXXX-XXXX 형식
 * 복합 형식(괄호, 쉼표 등)도 처리 가능
 *
 * @param {string} value - 사용자가 입력한 전화번호
 * @param {string} type - 포맷팅 타입 ('overflowing'일 경우 길이 제한 없이 모든 입력 유지)
 * @returns {string} - 하이픈이 추가된 포맷된 전화번호
 */
export const formatKoreanPhoneNumber = (value, type = '') => {
  // 입력된 값이 없으면 빈 문자열 반환
  if (!value || value.length === 0) {
    return '';
  }

  // 복합 전화번호 형식 처리
  // 전화번호 패턴(숫자와 하이픈으로만 구성) 매칭
  const phonePattern = /(\d+(-\d+)*)/g;
  const hasMultipleFormats = /[(),]/.test(value) || value.includes(' ');

  if (hasMultipleFormats) {
    // 숫자와 하이픈으로 구성된 전화번호 부분만 매칭하여 포맷팅
    return value.replace(phonePattern, (match) => {
      return formatSinglePhoneNumber(match, type);
    });
  }

  // 단일 전화번호인 경우 직접 포맷팅
  return formatSinglePhoneNumber(value, type);
};

/**
 * 단일 전화번호 포맷팅을 위한 내부 함수
 * @param {string} value - 전화번호
 * @param {string} type - 포맷팅 타입
 * @returns {string} - 포맷팅된 전화번호
 */
const formatSinglePhoneNumber = (value, type = '') => {
  // 사용자가 하이픈을 입력했는지 확인
  const endsWithHyphen = value.endsWith('-');

  // 기존 하이픈 제거
  const cleanValue = value.replace(/-/g, '');

  // 입력된 값이 없으면 빈 문자열 반환
  if (cleanValue.length === 0) {
    return '';
  }

  const isOverflowing = type === 'overflowing';
  let formattedNumber = '';

  // 02로 시작하는 서울 지역번호
  if (cleanValue.startsWith('02')) {
    // 02 다음에 7자리 또는 8자리 번호가 올 수 있음
    if (cleanValue.length <= 2) {
      formattedNumber = cleanValue; // 02만 입력된 경우
    } else if (cleanValue.length <= 5) {
      // 02 + 1~3자리: 02-123
      formattedNumber = `${cleanValue.slice(0, 2)}-${cleanValue.slice(2)}`;
    } else if (cleanValue.length <= 9) {
      // 중간이 3자리인 경우: 02-123-4567
      formattedNumber = `${cleanValue.slice(0, 2)}-${cleanValue.slice(2, 5)}-${cleanValue.slice(5)}`;
    } else if (cleanValue.length <= 10 || !isOverflowing) {
      // 중간이 4자리인 경우: 02-1234-5678
      formattedNumber = `${cleanValue.slice(0, 2)}-${cleanValue.slice(2, 6)}-${cleanValue.slice(6, 10)}`;
    } else {
      // overflowing 타입이고 10자리 초과: 02-1234-5678(추가 입력 - 하이픈 없음)
      formattedNumber = `${cleanValue.slice(0, 2)}-${cleanValue.slice(2, 6)}-${cleanValue.slice(6)}`;
    }
  }
  // 010으로 시작하는 휴대폰 번호
  else if (cleanValue.startsWith('010')) {
    if (cleanValue.length <= 3) {
      formattedNumber = cleanValue; // 010만 입력된 경우
    } else if (cleanValue.length <= 7) {
      // 010 + 1~4자리: 010-1234
      formattedNumber = `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
    } else if (cleanValue.length <= 11 || !isOverflowing) {
      // 010-XXXX-XXXX 형식
      formattedNumber = `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 7)}-${cleanValue.slice(7, 11)}`;
    } else {
      // overflowing 타입이고 11자리 초과: 010-1234-5678(추가 입력 - 하이픈 없음)
      formattedNumber = `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 7)}-${cleanValue.slice(7)}`;
    }
  }
  // 그 외 다른 지역번호 (031, 032 등)
  else {
    if (cleanValue.length <= 3) {
      formattedNumber = cleanValue; // 지역번호만 입력된 경우
    } else if (cleanValue.length <= 6) {
      // 지역번호 + 1~3자리: 031-123
      formattedNumber = `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
    } else if (cleanValue.length <= 10 || !isOverflowing) {
      // 지역번호-국번-번호 형식: 031-123-4567
      formattedNumber = `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}`;
    } else {
      // overflowing 타입이고 10자리 초과: 031-123-4567(추가 입력 - 하이픈 없음)
      formattedNumber = `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`;
    }
  }

  // 사용자가 하이픈을 입력했고, 포맷된 번호가 이미 하이픈으로 끝나지 않는 경우
  if (endsWithHyphen && !formattedNumber.endsWith('-')) {
    return formattedNumber + '-';
  }

  return formattedNumber;
};

/**
 * 전화번호 유효성 검사 함수
 *
 * @param {string} phoneNumber - 검사할 전화번호 (하이픈 포함 또는 미포함)
 * @returns {boolean} - 유효한 전화번호인지 여부
 */
export const isValidPhoneNumber = (phoneNumber) => {
  // 하이픈을 제거한 순수 숫자만 추출
  const onlyNums = phoneNumber.replace(/[^\d]/g, '');

  // 한국 전화번호 패턴 검사 (총 10-11자리, 대부분 휴대폰은 010으로 시작하는 11자리)
  // 지역번호(02, 051 등)로 시작하는 전화번호도 허용
  return /^(01[016789]\d{7,8}|02\d{7,8}|0[3-9]\d{7,8})$/.test(onlyNums);
};
