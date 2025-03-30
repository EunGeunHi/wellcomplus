import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuthAPI } from '@/app/api/middleware';

// GET 요청 핸들러를 withAuthAPI로 래핑
export const GET = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
    await connectDB();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('사용자 조회 중 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
});
