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
    errors.push('문의제목, 문의내용, 연락처는 필수로 작성해야 합니다.');
  }

  return errors;
};

// 콘솔에 폼 데이터 출력 (개발용)
export const logFormData = (formData, selectedFiles, formatFileSize) => {
  console.log('=== 기타 문의 내용 ===');
  console.log('문의제목:', formData.title);
  console.log('문의내용:', formData.content);
  console.log('연락처:', formData.phoneNumber);
  console.log('첨부파일 개수:', selectedFiles.length);
  console.log(
    '첨부파일 목록:',
    selectedFiles.map((file) => `${file.name} (${formatFileSize(file.size)})`)
  );
};
