import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';

/**
 * 특정 리뷰의 이미지 목록 조회 API (GET)
 * 인증된 사용자만 접근 가능
 */
export const GET = withAuthAPI(async (req, { params, session }) => {
  const { id, reviewId } = params;

  // 본인의 정보만 조회할 수 있도록 검증
  if (session.user.id !== id) {
    return NextResponse.json({ error: '자신의 리뷰만 조회할 수 있습니다.' }, { status: 403 });
  }

  try {
    // MongoDB 연결
    await connectDB();

    // 특정 리뷰 조회 (이미지 데이터 제외)
    const review = await Review.findOne({
      _id: reviewId,
      userId: id,
      isDeleted: false,
    })
      .select('images')
      .lean();

    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미지 메타데이터 반환 (스키마 필수 필드 포함)
    const images = review.images
      ? review.images.map((image) => ({
          id: image._id,
          url: image.url || `/api/reviews/images/${reviewId}/${image._id}`, // Blob Storage URL 우선 사용
          filename: image.filename,
          originalName: image.originalName,
          mimeType: image.mimeType,
          size: image.size,
          cloudinaryId: image.cloudinaryId || image.blobId, // fallback for legacy data
          uploadedAt: image.uploadedAt,
        }))
      : [];

    // 성공 응답
    return NextResponse.json({
      success: true,
      reviewId,
      images,
    });
  } catch (error) {
    console.error('리뷰 이미지 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
