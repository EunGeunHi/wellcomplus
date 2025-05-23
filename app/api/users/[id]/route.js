import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Application from '@/models/Application';
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

    // 사용자의 견적 신청 내역 조회
    const applications = await Application.find({ userId: id })
      .sort({ createdAt: -1 })
      .select('type status createdAt');

    return NextResponse.json({
      user,
      applications,
    });
  } catch (error) {
    console.error('사용자 조회 중 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
});

// PATCH 요청 핸들러 - 사용자 정보 업데이트
export const PATCH = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  // 본인의 정보만 수정할 수 있도록 검증
  if (session.user.id !== id) {
    return NextResponse.json({ error: '자신의 정보만 수정할 수 있습니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, phoneNumber } = body;

    // 필수 필드 확인
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: '이름과 전화번호는 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 전화번호 중복 확인 (현재 사용자 제외)
    if (phoneNumber) {
      const existingUser = await User.findOne({
        phoneNumber,
        _id: { $ne: id },
      });

      if (existingUser) {
        return NextResponse.json({ error: '이미 사용 중인 전화번호입니다.' }, { status: 400 });
      }
    }

    // 사용자 정보 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, phoneNumber },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      message: '사용자 정보가 성공적으로 업데이트되었습니다.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('사용자 정보 업데이트 중 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
});
