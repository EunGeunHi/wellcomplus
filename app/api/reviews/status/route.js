import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withKingAuthAPI } from '../../middleware';

async function handler(req) {
  try {
    if (req.method !== 'PATCH') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: '리뷰 ID와 상태값이 필요합니다.' }, { status: 400 });
    }

    // Validate the status value
    const validStatuses = ['register', 'active', 'hidden', 'deleted'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 });
    }

    await connectDB();

    // Update the review status
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!updatedReview) {
      return NextResponse.json({ error: '해당 리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const PATCH = withKingAuthAPI(handler);
