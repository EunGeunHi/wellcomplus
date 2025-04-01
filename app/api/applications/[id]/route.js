import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withAuthAPI } from '@/app/api/middleware';

async function handler(request, { params }) {
  try {
    const { id } = params;

    // MongoDB 연결
    await connectDB();

    // 신청 정보 조회
    const application = await Application.findById(id).lean();

    if (!application) {
      return NextResponse.json({ error: '신청 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 응답 데이터 구성

    return NextResponse.json(application);
  } catch (error) {
    console.error('신청 상세 정보 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '신청 정보를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// withAuthAPI 미들웨어 적용
export const GET = withAuthAPI(handler);
