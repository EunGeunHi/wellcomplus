import { REQUIRED_FIELDS } from './constants';

// 파일 크기를 사람이 읽기 쉬운 형태로 변환
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// 폼 데이터 검증
export const validateForm = (formData) => {
  const errors = [];

  // 필수 필드 검증
  const missingFields = REQUIRED_FIELDS.filter((field) => !formData[field]?.trim());
  if (missingFields.length > 0) {
    errors.push('A/S분류, 문제설명, 연락처, 수령방법은 필수로 작성해야 합니다.');
  }

  // 택배 선택시 주소 필수 검증
  if (formData.deliveryMethod === '택배' && !formData.address?.trim()) {
    errors.push('택배 수령을 선택하신 경우 주소를 입력해주세요.');
  }

  return errors;
};

// 콘솔에 폼 데이터 출력 (개발용)
export const logFormData = (formData, selectedFiles, formatFileSize) => {
  console.log('=== A/S 신청 내용 ===');
  console.log('A/S분류:', formData.asCategory);

  if (formData.asCategory === '컴퓨터' || formData.asCategory === '노트북') {
    console.log('구매 당시 사용자 이름 :', formData.userName || '없음');
    console.log('구매 당시  PC번호:', formData.pcNumber || '없음');
  }

  if (formData.asCategory === '프린터') {
    console.log('구매 당시 사용자 이름:', formData.userName || '없음');
    console.log('프린터 종류:', formData.printerType || '선택안함');
    console.log('무한 잉크젯:', formData.infiniteInk || '선택안함');
  }

  console.log('문제 설명:', formData.description);
  console.log('연락처:', formData.phoneNumber);
  console.log('수령방법:', formData.deliveryMethod);
  if (formData.deliveryMethod === '택배') {
    console.log('배송주소:', formData.address);
  }
  console.log('첨부파일 개수:', selectedFiles.length);
  console.log(
    '첨부파일 목록:',
    selectedFiles.map((file) => `${file.name} (${formatFileSize(file.size)})`)
  );
};
