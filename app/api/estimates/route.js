import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
import { withKingAuthAPI } from '@/app/api/middleware';

// 새 견적 생성 API
export const POST = withKingAuthAPI(async (request, { session }) => {
  try {
    await connectDB();

    // 요청 본문에서 견적 데이터 파싱
    const estimateData = await request.json();

    // 필수 정보 검증
    if (!estimateData.estimateType || !estimateData.customerInfo.name) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다. 견적 유형과 고객 정보는 필수입니다.' },
        { status: 400 }
      );
    }

    // 계산된 값 검증
    if (
      !estimateData.calculatedValues ||
      typeof estimateData.calculatedValues.productTotal !== 'number' ||
      typeof estimateData.calculatedValues.totalPurchase !== 'number' ||
      typeof estimateData.calculatedValues.vatAmount !== 'number' ||
      typeof estimateData.calculatedValues.finalPayment !== 'number'
    ) {
      return NextResponse.json(
        {
          error: '계산된 값이 유효하지 않습니다. 클라이언트에서 계산이 올바르게 이루어져야 합니다.',
        },
        { status: 400 }
      );
    }

    // 생성 및 수정 시간 설정
    const now = new Date();
    estimateData.createdAt = now;
    estimateData.updatedAt = now;

    // 새 견적 생성 - 클라이언트에서 계산된 값을 그대로 사용
    const newEstimate = await Estimate.create(estimateData);

    return NextResponse.json({
      success: true,
      message: '견적이 성공적으로 생성되었습니다.',
      estimate: newEstimate,
    });
  } catch (error) {
    console.error('견적 생성 오류:', error);
    return NextResponse.json({ error: '견적 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
});
