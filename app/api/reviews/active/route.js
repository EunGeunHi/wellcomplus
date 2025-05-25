import connectDB from '../../../../lib/mongodb';
import Review from '../../../../models/review';
import User from '../../../../models/User';
import { NextResponse } from 'next/server';

// Next.js App Router 캐싱 방지 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    // URL searchParams를 사용하여 dynamic route로 만들기
    const { searchParams } = new URL(request.url);
    const timestamp = searchParams.get('t') || Date.now();

    await connectDB();

    // active 상태의 리뷰만 조회
    const activeReviews = await Review.find({ status: 'active' })
      .populate({
        path: 'userId',
        select: 'name', // User 모델에서 이름만 선택
        model: User, // User 모델 명시적 지정
      })
      .select('-images.data') // 이미지 바이너리 데이터 제외
      .sort({ createdAt: -1 }) // 최신순으로 정렬
      .lean(); // 성능 최적화를 위한 lean() 사용

    // active 리뷰가 없으면 빈 배열 반환
    if (activeReviews.length === 0) {
      return NextResponse.json([]);
    }

    // 이미지 메타데이터만 포함한 응답 생성
    const optimizedReviews = activeReviews.map((review) => {
      // 이미지가 있는 경우 메타데이터만 포함
      if (review.images && review.images.length > 0) {
        review.images = review.images
          .map((image) => {
            // ID 검증
            if (!image._id || !review._id) {
              return null;
            }

            const imageUrl = `/api/reviews/images/${review._id}/${image._id}`;

            return {
              id: image._id,
              originalName: image.originalName,
              mimeType: image.mimeType,
              size: image.size,
              url: imageUrl,
            };
          })
          .filter(Boolean); // null 값 제거
      }

      return review;
    });

    // 캐싱 방지 헤더 추가 (더 강력한 설정)
    const response = NextResponse.json(optimizedReviews);
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"${timestamp}"`);
    response.headers.set('Vary', '*');

    return response;
  } catch (error) {
    console.error('Error fetching active reviews:', error);
    return NextResponse.json(
      { message: 'Failed to fetch active reviews', error: error.message },
      { status: 500 }
    );
  }
}
