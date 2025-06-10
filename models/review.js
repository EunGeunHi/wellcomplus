import mongoose from 'mongoose';

/**
 * 사용자 리뷰 정보를 저장하기 위한 MongoDB 스키마
 * Cloudinary를 사용하여 이미지 저장
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
    images: [
      {
        url: {
          type: String,
          required: true, // Cloudinary secure_url
        },
        filename: {
          type: String,
          required: true, // Cloudinary에서의 파일명
        },
        originalName: {
          type: String,
          required: true, // 사용자가 업로드한 원본 파일명
        },
        mimeType: {
          type: String,
          required: true,
          enum: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], // jpg, jpeg, png, webp 허용
        },
        size: {
          type: Number,
          required: true, // 파일 크기 (바이트)
        },
        cloudinaryId: {
          type: String,
          required: true, // Cloudinary public_id (삭제시 필요)
        },
        uploadedAt: {
          type: Date,
          default: Date.now, // 업로드 시간
        },
      },
    ],
  },
  { timestamps: true } // 생성 및 수정 시간 자동 기록
);

// 이미지 검증 미들웨어
reviewSchema.pre('save', function (next) {
  if (this.images && this.images.length > 5) {
    const error = new Error('이미지는 최대 5장까지만 업로드 가능합니다.');
    return next(error);
  }

  next();
});

// 특정 이미지 URL 반환
reviewSchema.methods.getImageUrl = function (imageIndex) {
  if (!this.images || !this.images[imageIndex]) {
    return null;
  }

  return this.images[imageIndex].url;
};

// 모든 이미지 정보 반환
reviewSchema.methods.getImageUrls = function () {
  if (!this.images || this.images.length === 0) {
    return [];
  }

  return this.images.map((image) => ({
    id: image._id,
    url: image.url,
    filename: image.filename,
    originalName: image.originalName,
    mimeType: image.mimeType,
    size: image.size,
    uploadedAt: image.uploadedAt,
  }));
};

// JSON 변환 (모든 이미지 정보 포함)
reviewSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();

  if (obj.images) {
    obj.images = obj.images.map((image) => ({
      id: image._id,
      url: image.url,
      filename: image.filename,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
      uploadedAt: image.uploadedAt,
    }));
  }

  return obj;
};

// 성능 최적화를 위한 인덱스 추가
reviewSchema.index({ status: 1, createdAt: -1 }); // 상태별 최신순 조회
reviewSchema.index({ userId: 1, createdAt: -1 }); // 사용자별 최신순 조회
reviewSchema.index({ serviceType: 1, status: 1 }); // 서비스 타입별 상태 조회
reviewSchema.index({ content: 'text' }); // 텍스트 검색용 인덱스

// 이미 모델이 있으면 기존 모델을 사용, 없으면 새로 생성
export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
