import mongoose from 'mongoose';

/**
 * 사용자 정보를 저장하기 위한 MongoDB 스키마
 *
 * timestamps: true 옵션으로 createdAt, updatedAt 필드가 자동 생성됨
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // 필수 입력 필드
    },
    email: {
      type: String,
      required: false, // 카카오 로그인을 위해 필수 필드에서 선택적 필드로 변경
      unique: true, // 이메일 중복 방지
      sparse: true, // null 값은 unique 제약조건에서 제외
    },
    phoneNumber: {
      type: String,
      // 소셜 로그인을 위해 필수 필드에서 선택적 필드로 변경
      required: false,
      // unique 옵션 유지 (값이 있는 경우 중복 방지)
      unique: true, // 전화번호 중복 방지
      sparse: true, // null 값은 unique 제약조건에서 제외
    },
    password: {
      type: String, // 해시된 비밀번호가 저장됨
    },
    image: {
      type: String, // 프로필 이미지 URL
    },
    authority: {
      type: String,
      default: 'user', // 기본값은 일반 사용자
    },
    provider: {
      type: String, // 로그인 제공자 (google, credentials 등)
      default: 'credentials',
    },
    providerId: {
      type: String, // 소셜 로그인 제공자의 고유 ID
    },
    lastLoginAt: {
      type: Date, // 마지막 로그인 날짜 및 시간
      default: null, // 초기값은 null (로그인 전)
    },
    isDeleted: {
      type: Boolean, // 탈퇴 유무
      default: false, // 초기값은 false (탈퇴 안함)
    },
  },
  { timestamps: true } // 생성 및 수정 시간 자동 기록
);

// 이미 모델이 있으면 기존 모델을 사용, 없으면 새로 생성
export default mongoose.models.User || mongoose.model('User', userSchema);
