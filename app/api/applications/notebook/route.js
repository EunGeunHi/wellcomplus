import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import { withAuthAPI } from '../../middleware';

async function handler(req, { session }) {
  try {
    await connectDB();

    const data = await req.json();

    // 필수 필드 검증
    if (!data.purpose || !data.os) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 사용자 정보 조회
    const user = await User.findById(session.user.id);
    // if (!user) {
    //   return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    // }

    // 신청서 생성
    const application = await Application.create({
      type: 'notebook',
      userId: session.user.id,
      notebook_information: {
        modelName: data.modelName || '',
        manufacturer: data.manufacturer || '',
        brand: data.brand || '',
        screenSize: data.screenSize || '',
        cpuType: data.cpuType || '',
        gpuType: data.gpuType || '',
        ramSize: data.ramSize || '',
        storageSize: data.storageSize || '',
        os: data.os,
        weight: data.weight || '',
        priceRange: data.priceRange || '',
        purpose: data.purpose,
        additionalRequests: data.additionalRequests || '',
        phoneNumber:
          data.phoneNumber?.trim().length > 0 ? data.phoneNumber : user.phoneNumber || '',
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
