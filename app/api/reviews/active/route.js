import connectDB from '../../../../lib/mongodb';
import Review from '../../../../models/review';
import User from '../../../../models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();

    const activeReviews = await Review.find({ status: 'active' })
      .populate({
        path: 'userId',
        select: 'name', // User 모델에서 이름만 선택
        model: User, // User 모델 명시적 지정
      })
      .sort({ createdAt: -1 }); // 최신순으로 정렬 (선택 사항)

    // Base64 이미지 URL 포함한 응답 생성
    const reviewsWithImages = activeReviews.map((review) => {
      const reviewObj = review.toObject();

      if (reviewObj.images && reviewObj.images.length > 0) {
        reviewObj.images = reviewObj.images.map((image) => ({
          id: image._id,
          originalName: image.originalName,
          url: `data:${image.mimeType};base64,${image.data.toString('base64')}`,
        }));
      }

      return reviewObj;
    });

    return NextResponse.json(reviewsWithImages);
  } catch (error) {
    console.error('Error fetching active reviews:', error);
    return NextResponse.json(
      { message: 'Failed to fetch active reviews', error: error.message },
      { status: 500 }
    );
  }
}
