import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
import { withAuthAPI } from '@/app/api/middleware';

export const GET = withAuthAPI(async (req, { params, session }) => {
  // 관리자(king) 권한이 없으면 접근 불가
  if (session.user.authority !== 'king') {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  const { id } = params;

  try {
    await connectDB();

    // ID 유효성 검사
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: '유효하지 않은 견적 ID입니다.' }, { status: 400 });
    }

    const estimate = await Estimate.findById(id).lean();

    if (!estimate) {
      return NextResponse.json({ error: '견적 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ estimate });
  } catch (error) {
    console.error('견적 상세 조회 중 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
});
