// 폼 필드 옵션들
export const FORM_OPTIONS = {
  asCategory: ['컴퓨터', '노트북', '프린터', '기타'],
  printerType: ['잉크젯', '레이저'],
  infiniteInk: ['정품무한', '개조무한'],
  deliveryMethod: ['직접방문', '택배'],
};

// 파일 업로드 제한
export const FILE_CONSTRAINTS = {
  MAX_FILES: 5, // 최대 5개 파일
  ACCEPTED_TYPES: 'image/*,.pdf,.doc,.docx,.txt',
};

// 필수 필드들
export const REQUIRED_FIELDS = ['asCategory', 'description', 'phoneNumber', 'deliveryMethod'];

// 기본 폼 데이터
export const INITIAL_FORM_DATA = {
  asCategory: '',
  userName: '', // 컴퓨터/노트북/프린터용 사용자 이름
  pcNumber: '', // 컴퓨터/노트북용 PC번호
  printerType: '', // 프린터용 프린터 종류
  infiniteInk: '', // 프린터용 무한 잉크젯
  description: '', // 문제 설명
  phoneNumber: '', // 연락처
  deliveryMethod: '', // 수령방법
  address: '', // 배송주소
};

// 기본 섹션 상태 (수령방법은 항상 표시되므로 제거)
export const INITIAL_SECTIONS_STATE = {};
