import { NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '../../../../lib/review-storage.js';

/**
 * 리뷰 이미지 업로드 API (Cloudinary 사용)
 * POST /api/reviews/upload-token
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const userId = formData.get('userId');
    const reviewId = formData.get('reviewId');

    if (!image || !userId || !reviewId) {
      return NextResponse.json(
        { error: '이미지, 사용자 ID, 리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 이미지 파일 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 이미지 형식입니다. (JPG, PNG만 허용)' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB 제한)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '이미지 크기는 5MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Cloudinary에 이미지 업로드
    const uploadResult = await uploadImageToCloudinary(image, userId, reviewId, image.name);

    return NextResponse.json({
      success: true,
      image: uploadResult,
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return NextResponse.json(
      { error: error.message || '이미지 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
