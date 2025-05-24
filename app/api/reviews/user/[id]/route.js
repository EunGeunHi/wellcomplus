import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';

/**
 * 특정 사용자의 리뷰 목록 조회 API (GET)
 * 인증된 사용자만 접근 가능
 */
export const GET = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  // 본인의 정보만 조회할 수 있도록 검증
  if (session.user.id !== id) {
    return NextResponse.json({ error: '자신의 리뷰만 조회할 수 있습니다.' }, { status: 403 });
  }

  try {
    // MongoDB 연결
    await connectDB();

    // 해당 사용자의 리뷰 조회 (삭제되지 않은 리뷰만)
    const reviews = await Review.find({
      userId: id,
      isDeleted: false,
    }).sort({ createdAt: -1 }); // 최신순 정렬

    // 이미지 포함한 리뷰 데이터 변환
    const reviewsWithImages = reviews.map((review) => ({
      id: review._id,
      serviceType: review.serviceType,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      images: review.getImageUrls(), // 이미지 URL 포함
    }));

    // 성공 응답
    return NextResponse.json({
      success: true,
      reviews: reviewsWithImages,
    });
  } catch (error) {
    console.error('리뷰 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
