import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withKingAuthAPI } from '@/app/api/middleware';
import { deleteReviewImagesFromCloudinary } from '@/lib/review-storage';

/**
 * 리뷰 완전 삭제 API
 * 삭제됨 상태의 리뷰만 삭제 가능
 * 관리자만 접근 가능
 */
export const DELETE = withKingAuthAPI(async (req, { params }) => {
  try {
    const { id } = params;

    // MongoDB 연결
    await connectDB();

    // 리뷰 조회
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: '해당 리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 삭제됨 상태인지 확인
    if (review.status !== 'deleted') {
      return NextResponse.json(
        { error: '삭제됨 상태의 리뷰만 완전 삭제할 수 있습니다.' },
        { status: 400 }
      );
    }

    // Cloudinary에서 모든 이미지 삭제
    if (review.images && review.images.length > 0) {
      try {
        await deleteReviewImagesFromCloudinary(review.images);
      } catch (error) {
        console.error('Cloudinary 이미지 삭제 오류:', error);
        // Cloudinary 삭제 실패해도 DB 삭제는 진행
      }
    }

    // MongoDB에서 리뷰 완전 삭제
    await Review.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: '리뷰가 완전히 삭제되었습니다.',
    });
  } catch (error) {
    console.error('리뷰 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
