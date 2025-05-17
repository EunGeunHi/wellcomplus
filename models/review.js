import mongoose from 'mongoose';

/**
 * 사용자 리뷰 정보를 저장하기 위한 MongoDB 스키마
 *
 * timestamps: true 옵션으로 createdAt, updatedAt 필드가 자동 생성됨
 */
const reviewSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: true, // 필수 입력 필드
      enum: ['computer', 'printer', 'notebook', 'as', 'other'], // 허용되는 값 목록
    },
    rating: {
      type: Number,
      required: true, // 필수 입력 필드
      min: 1, // 최소값
      max: 5, // 최대값
    },
    content: {
      type: String,
      required: true, // 필수 입력 필드
      minlength: 10, // 최소 길이
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User 모델 참조
      required: true, // 필수 입력 필드
    },
    status: {
      type: String,
      enum: ['register', 'active', 'hidden', 'deleted'], // 리뷰 상태
      default: 'register', // 기본값
    },
    isDeleted: {
      type: Boolean, // 삭제 유무
      default: false, // 초기값은 false (삭제 안함)
    },
  },
  { timestamps: true } // 생성 및 수정 시간 자동 기록
);

// 이미 모델이 있으면 기존 모델을 사용, 없으면 새로 생성
export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
