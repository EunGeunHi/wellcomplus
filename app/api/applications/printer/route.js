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

    // 필수 필드 검증
    if (!data.purpose || !data.requirements || !data.phoneNumber) {
      return NextResponse.json(
        { error: '사용 목적, 필요 기능, 연락처는 필수로 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 신청서 생성
    const application = await Application.create({
      type: 'printer',
      userId: session.user.id,
      printer_information: {
        modelName: data.modelName || '',
        purpose: data.purpose,
        requirements: data.requirements,
        modification: data.modification || '',
        additional: data.additional || '',
        phoneNumber:
          data.phoneNumber?.trim().length > 0 ? data.phoneNumber : user.phoneNumber || '',
        address: data.address || '',
      },
    });

    return NextResponse.json(
      { message: '견적 신청이 완료되었습니다.', application },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const POST = withAuthAPI(handler);
