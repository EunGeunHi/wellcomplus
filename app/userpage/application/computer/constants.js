// 폼 필드 옵션들
export const FORM_OPTIONS = {
  os: ['Windows 10', 'Windows 11'],
  cpu: ['인텔', 'AMD'],
  gpu: ['NVIDIA', 'AMD'],
  memory: ['4GB이하', '8GB', '16GB', '32GB', '64GB이상'],
  storage: ['500GB이하', '1TB', '2TB', '3TB이상'],
  cooling: ['공냉', '수냉', '커스텀수냉'],
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
  ACCEPTED_TYPES:
    '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar,.7z',
};

// 필수 필드들
export const REQUIRED_FIELDS = ['purpose', 'budget', 'os', 'phoneNumber'];

// 기본 폼 데이터
export const INITIAL_FORM_DATA = {
  purpose: '',
  budget: '',
  cpu: '',
  gpu: '',
  memory: '',
  storage: '',
  cooling: '',
  os: '',
  additionalRequests: '',
  phoneNumber: '',
  deliveryMethod: '',
  address: '',
};

// 기본 섹션 상태 (모두 닫힘)
export const INITIAL_SECTIONS_STATE = {
  cpu: false,
  gpu: false,
  memory: false,
  storage: false,
  cooling: false,
  additionalRequests: false,
  deliveryMethod: false,
};
