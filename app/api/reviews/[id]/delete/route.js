import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';
import { deleteReviewImagesFromBlob } from '@/lib/review-blob-storage';

/**
 * 리뷰 삭제 API (isDeleted 플래그를 true로 설정)
 * 인증된 사용자만 접근 가능
 */
export const PATCH = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
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
        { error: '본인이 작성한 리뷰만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    // isDeleted 플래그를 true로 업데이트
    review.isDeleted = true;
    review.status = 'register';
    await review.save();

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('리뷰 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
