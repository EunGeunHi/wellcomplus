import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';

/**
 * 리뷰 수정 API (PATCH)
 * 인증된 사용자만 접근 가능
 */
export const PATCH = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
    const { content, rating, serviceType } = await req.json();

    // 필수 필드 검증
    if (!content || !rating || !serviceType) {
      return NextResponse.json(
        { error: '서비스 유형, 별점, 리뷰 내용은 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    // 리뷰 내용 길이 검증
    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: '리뷰 내용은 최소 10자 이상 작성해야 합니다.' },
        { status: 400 }
      );
    }

    // 별점 범위 검증
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '별점은 1점에서 5점 사이로 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // MongoDB 연결
    await connectDB();

    // 리뷰 조회
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 리뷰 작성자와 현재 사용자가 일치하는지 확인
    if (review.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: '본인이 작성한 리뷰만 수정할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 리뷰 업데이트
    review.content = content;
    review.rating = rating;
    review.serviceType = serviceType;

    // 상태를 'register'로 다시 변경 (관리자 검토를 위해)
    review.status = 'register';

    await review.save();

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 수정되었습니다.',
      review: {
        id: review._id,
        serviceType: review.serviceType,
        rating: review.rating,
        content: review.content,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error('리뷰 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
