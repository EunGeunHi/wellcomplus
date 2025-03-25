import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withKingAuthAPI } from '../middleware';

// GET 요청 핸들러를 withKingAuthAPI로 래핑
export const GET = withKingAuthAPI(async (req, { session }) => {
  try {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('사용자 조회 중 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
});
