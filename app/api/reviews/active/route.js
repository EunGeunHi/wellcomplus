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

    return NextResponse.json(activeReviews, { status: 200 });
  } catch (error) {
    console.error('Error fetching active reviews:', error);
    return NextResponse.json(
      { message: 'Failed to fetch active reviews', error: error.message },
      { status: 500 }
    );
  }
}
