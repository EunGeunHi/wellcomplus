import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuthAPI } from '@/app/api/middleware';

// 세션 갱신 API 엔드포인트
export const POST = withAuthAPI(async (req, { session }) => {
  try {
    await connectDB();

    // 현재 로그인한 사용자의 최신 정보 조회
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 세션 갱신을 위한 응답 - 클라이언트에서 세션 업데이트를 트리거
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        authority: user.authority,
      },
    });
  } catch (error) {
    console.error('세션 갱신 중 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
});
