/**
 * 숫자 포맷팅 함수 (천 단위 쉼표)
 * @param {number|string} num - 포맷팅할 숫자
 * @returns {string} 쉼표가 포함된 포맷팅된 숫자 문자열
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '-';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 문자열에서 숫자만 추출 (쉼표 제거)
 * @param {string} str - 쉼표가 포함된 문자열
 * @returns {string} 숫자만 포함된 문자열
 */
export const removeCommas = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[^0-9]/g, '');
};

/**
 * 숫자 입력 시 자동으로 쉼표 적용
 * @param {string} value - 입력된 값
 * @returns {string} 쉼표가 적용된 숫자 문자열
 */
export const formatNumberInput = (value) => {
  if (!value) return '';

  // 숫자만 추출
  const numbersOnly = removeCommas(value);

  // 빈 문자열이면 그대로 반환
  if (!numbersOnly) return '';

  // 쉼표 적용하여 반환
  return formatNumber(numbersOnly);
};
