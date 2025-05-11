import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
import { withKingAuthAPI } from '@/app/api/middleware';

export const DELETE = withKingAuthAPI(async (req, { session }) => {
  try {
    const body = await req.json();
    const { startDate, endDate, excludeOldData } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '시작일과 종료일을 모두 지정해야 합니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 특정 기간 내 비계약자(isContractor=false) 견적만 삭제
    const deleteQuery = {
      isContractor: false,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // 예전데이터 제외 옵션이 활성화된 경우
    if (excludeOldData) {
      deleteQuery.estimateType = { $ne: '예전데이터' };
    }

    // 삭제 작업 수행
    const result = await Estimate.deleteMany(deleteQuery);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount}개의 비계약자 데이터가 삭제되었습니다.`,
    });
  } catch (error) {
    console.error('비계약자 데이터 삭제 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
});
