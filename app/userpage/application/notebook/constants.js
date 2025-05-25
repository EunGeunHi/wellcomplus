// 폼 필드 옵션들
export const FORM_OPTIONS = {
  cpu: ['인텔', 'AMD'],
  gpu: ['NVIDIA', 'AMD'],
  weight: ['1kg이하', '1~1.5kg', '1.6~2kg', '2.1~2.6kg', '2.7~3kg', '3kg이상'],
  os: ['미포함', 'Windows 10', 'Windows 11', 'macOS'],
  ram: ['2GB이하', '4GB', '8GB', '16GB', '32GB', '64GB이상'],
  storage: ['64GB이하', '500GB', '1TB', '2TB', '3TB이상'],
  deliveryMethod: ['직접방문', '택배'],
};

// 예산 버튼 금액들
export const BUDGET_AMOUNTS = [
  { label: '+ 10만원', value: 100000 },
  { label: '+ 50만원', value: 500000 },
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
  cpu: '',
  gpu: '',
  weight: '',
  os: '',
  ram: '',
  storage: '',
  additionalRequests: '',
  phoneNumber: '',
  deliveryMethod: '',
  address: '',
};

// 기본 섹션 상태 (모두 닫힘)
export const INITIAL_SECTIONS_STATE = {
  cpu: false,
  gpu: false,
  weight: false,
  os: false,
  ram: false,
  storage: false,
  additionalRequests: false,
  deliveryMethod: false,
};
