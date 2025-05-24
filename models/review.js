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
    images: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
          enum: ['image/jpeg', 'image/png'], // jpg, png만 허용
        },
        size: {
          type: Number,
          required: true,
        },
        data: {
          type: Buffer, // 바이너리 데이터로 저장
          required: true,
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

  if (this.images && this.images.length > 0) {
    const totalSize = this.images.reduce((sum, img) => sum + img.size, 0);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (totalSize > maxSize) {
      const error = new Error('이미지 총 크기는 10MB를 초과할 수 없습니다.');
      return next(error);
    }
  }

  next();
});

// 이미지를 안전하게 반환하기 위한 메서드
reviewSchema.methods.getImageUrl = function (imageIndex) {
  if (!this.images || !this.images[imageIndex]) {
    return null;
  }

  const image = this.images[imageIndex];
  const base64Data = image.data.toString('base64');
  return `data:${image.mimeType};base64,${base64Data}`;
};

// 이미지 목록을 안전하게 반환하기 위한 메서드
reviewSchema.methods.getImageUrls = function () {
  if (!this.images || this.images.length === 0) {
    return [];
  }

  return this.images.map((image) => {
    const base64Data = image.data.toString('base64');
    return {
      id: image._id,
      filename: image.filename,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
      url: `data:${image.mimeType};base64,${base64Data}`,
    };
  });
};

// 이미지 데이터를 제외한 안전한 JSON 변환
reviewSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();

  if (obj.images) {
    obj.images = obj.images.map((image) => ({
      id: image._id,
      filename: image.filename,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
    }));
  }

  return obj;
};

// 이미지를 포함한 전체 데이터 반환
reviewSchema.methods.toJSONWithImages = function () {
  const obj = this.toObject();

  if (obj.images) {
    obj.images = this.getImageUrls();
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
