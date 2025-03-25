/**
 * 전화번호 입력 시 자동으로 하이픈(-)을 추가하는 함수
 * 010-1234-5678 형식으로 변환
 * 사용자는 숫자만 입력하고 하이픈은 자동으로 추가됨
 *
 * @param {string} value - 사용자가 입력한 전화번호 문자열
 * @returns {string} - 하이픈이 추가된 포맷된 전화번호
 */
export const formatPhoneNumber = (value) => {
  // 입력값에서 숫자가 아닌 문자를 모두 제거
  const onlyNums = value.replace(/[^\d]/g, '');

  // 입력된 숫자가 없으면 빈 문자열 반환
  if (onlyNums.length === 0) {
    return '';
  }

  // 첫 3자리 (지역번호 또는 휴대폰 번호 앞자리)
  if (onlyNums.length <= 3) {
    return onlyNums;
  }

  // 중간 자리 (4자리 이상 ~ 7자리 미만)
  if (onlyNums.length <= 7) {
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
  }

  // 전체 번호 (8자리 이상)
  return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
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
