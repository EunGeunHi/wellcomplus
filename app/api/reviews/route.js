import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';

/**
 * 리뷰 등록 API (POST)
 * 인증된 사용자만 접근 가능
 */
export const POST = withAuthAPI(async (req, { session }) => {
  try {
    const { serviceType, rating, content } = await req.json();

    // 필수 필드 검증
    if (!serviceType || !rating || !content) {
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

    // 리뷰 생성
    const newReview = new Review({
      serviceType,
      rating,
      content,
      userId: session.user.id, // 인증된 사용자 ID
      status: 'register', // 초기 상태: 등록됨
    });

    // 리뷰 저장
    await newReview.save();

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 등록되었습니다.',
      review: {
        id: newReview._id,
        serviceType: newReview.serviceType,
        rating: newReview.rating,
        content: newReview.content,
        createdAt: newReview.createdAt,
      },
    });
  } catch (error) {
    console.error('리뷰 등록 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
