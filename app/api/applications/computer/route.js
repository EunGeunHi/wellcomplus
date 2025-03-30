import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withAuthAPI } from '../../middleware';

async function handler(req, { session }) {
  try {
    await connectDB();

    const data = await req.json();

    // 필수 필드 검증
    if (!data.purpose || !data.budget || !data.requirements) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 신청서 생성
    const application = await Application.create({
      type: 'computer',
      userId: session.user.id,
      purpose: data.purpose,
      budget: data.budget,
      requirements: data.requirements,
      additional: data.additional || '',
      etc: data.etc || '',
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
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
