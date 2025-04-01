import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import { withAuthAPI } from '../../middleware';

async function handler(req, { session }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: '지원하지 않는 메서드입니다.' }, { status: 405 });
  }

  try {
    await connectDB();

    const data = await req.json();
    const { title, content, phoneNumber } = data;

    // 필수 필드 검증
    if (!title || !content || !phoneNumber) {
      return NextResponse.json(
        { error: '제목, 문의 내용, 연락처는 필수로 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 전화번호 처리
    const finalPhoneNumber = phoneNumber || user.phoneNumber || '';

    // 문의 생성
    const application = await Application.create({
      type: 'inquiry',
      userId: session.user.id,
      inquiry_information: {
        title,
        content,
        phoneNumber: finalPhoneNumber,
      },
    });

    return NextResponse.json({ message: '문의가 등록되었습니다.', application }, { status: 201 });
  } catch (error) {
    console.error('Error in inquiry submission:', error);
    return NextResponse.json({ error: '문의 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const POST = withAuthAPI(handler);
