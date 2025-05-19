import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { name, userId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: '이름이 필요합니다.' }, { status: 400 });
    }

    await connectDB();

    // 현재 사용자를 제외한 다른 사용자 중에서 동일한 이름이 있는지 확인
    const existingUser = await User.findOne({
      name: name,
      _id: { $ne: userId }, // 현재 사용자 ID를 제외
    });

    return NextResponse.json({
      isAvailable: !existingUser,
      message: existingUser ? '이미 사용 중인 이름입니다.' : '사용 가능한 이름입니다.',
    });
  } catch (error) {
    console.error('이름 중복 체크 중 오류:', error);
    return NextResponse.json({ error: '이름 중복 체크 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
