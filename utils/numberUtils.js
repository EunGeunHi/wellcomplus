/**
 * 숫자 포맷팅 함수 (천 단위 쉼표)
 * @param {number|string} num - 포맷팅할 숫자
 * @returns {string} 쉼표가 포함된 포맷팅된 숫자 문자열
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '-';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
