import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
import { withKingAuthAPI } from '@/app/api/middleware';

export const GET = withKingAuthAPI(async (req, { session }) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '시작일과 종료일을 모두 지정해야 합니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 특정 기간 내 비계약자(isContractor=false) 견적만 검색
    const query = {
      isContractor: false,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const estimates = await Estimate.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ estimates });
  } catch (error) {
    console.error('비계약자 검색 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
});
