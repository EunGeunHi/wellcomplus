// 폼 필드 옵션들
export const FORM_OPTIONS = {
  printerType: ['잉크젯', '레이저'],
  infiniteInk: ['정품무한', '개조무한'],
  outputColor: ['흑백(모노)출력', '컬러출력'],
  deliveryMethod: ['직접방문', '택배'],
};

// 예산 버튼 금액들
export const BUDGET_AMOUNTS = [
  { label: '+ 1만원', value: 10000 },
  { label: '+ 10만원', value: 100000 },
  { label: '+ 100만원', value: 1000000 },
];

// 파일 업로드 제한
export const FILE_CONSTRAINTS = {
  MAX_FILES: 5, // 최대 5개 파일
  ACCEPTED_TYPES: 'image/*,.pdf,.doc,.docx,.txt',
};

// 필수 필드들
export const REQUIRED_FIELDS = ['purpose', 'budget', 'phoneNumber'];

// 기본 폼 데이터
export const INITIAL_FORM_DATA = {
  purpose: '',
  budget: '',
  printerType: '',
  infiniteInk: '',
  outputColor: '',
  additionalRequests: '',
  phoneNumber: '',
  deliveryMethod: '',
  address: '',
};

// 기본 섹션 상태 (모두 닫힘)
export const INITIAL_SECTIONS_STATE = {
  printerType: false,
  infiniteInk: false,
  outputColor: false,
  additionalRequests: false,
  deliveryMethod: false,
};
