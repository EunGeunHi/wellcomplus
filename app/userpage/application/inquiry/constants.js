// 파일 업로드 제한
export const FILE_CONSTRAINTS = {
  MAX_FILES: 5, // 최대 5개 파일
  ACCEPTED_TYPES:
    '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar,.7z',
};

// 필수 필드들
export const REQUIRED_FIELDS = ['title', 'content', 'phoneNumber'];

// 기본 폼 데이터
export const INITIAL_FORM_DATA = {
  title: '',
  content: '',
  phoneNumber: '',
};

// 기본 섹션 상태 (기타 문의는 토글 섹션이 없음)
export const INITIAL_SECTIONS_STATE = {};
