import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';

/**
 * 특정 사용자의 리뷰 목록 조회 API (GET)
 * 인증된 사용자만 접근 가능
 * 페이지네이션 및 이미지 최적화 적용
 */
export const GET = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  // 본인의 정보만 조회할 수 있도록 검증
  if (session.user.id !== id) {
    return NextResponse.json({ error: '자신의 리뷰만 조회할 수 있습니다.' }, { status: 403 });
  }

  try {
    // URL searchParams 파싱
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10'); // 기본 10개로 제한
    const includeImages = searchParams.get('includeImages') === 'true'; // 이미지 포함 여부

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // MongoDB 연결
    await connectDB();

    // 기본 쿼리 (삭제되지 않은 리뷰만)
    const baseQuery = {
      userId: id,
      isDeleted: false,
    };

    // 총 리뷰 수 조회
    const totalCount = await Review.countDocuments(baseQuery);
    const totalPages = Math.ceil(totalCount / limit);

    // 리뷰 조회 - 이미지 데이터 제외하고 메타데이터만
    const reviews = await Review.find(baseQuery)
      .select('-images.data') // 이미지 바이너리 데이터 제외
      .sort({ createdAt: -1 }) // 최신순 정렬
      .skip(skip)
      .limit(limit)
      .lean(); // 성능 최적화

    // 리뷰 데이터 변환
    const reviewsWithOptimizedImages = reviews.map((review) => {
      const reviewData = {
        id: review._id,
        serviceType: review.serviceType,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        imageCount: review.images ? review.images.length : 0, // 이미지 개수만 우선 제공
      };

      // 이미지가 요청된 경우에만 URL 정보 포함
      if (includeImages && review.images && review.images.length > 0) {
        reviewData.images = review.images.map((image) => ({
          id: image._id,
          originalName: image.originalName,
          mimeType: image.mimeType,
          size: image.size,
          // 개별 이미지 조회 URL
          url: `/api/reviews/images/${review._id}/${image._id}`,
        }));
      }

      return reviewData;
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      reviews: reviewsWithOptimizedImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    console.error('리뷰 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
