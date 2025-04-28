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
    if (!estimateData.estimateType || !estimateData.customerInfo) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다. 견적 유형과 고객 정보는 필수입니다.' },
        { status: 400 }
      );
    }

    // 생성 및 수정 시간 설정
    const now = new Date();
    estimateData.createdAt = now;
    estimateData.updatedAt = now;

    // 상품 가격 계산
    let productTotal = 0;
    if (estimateData.tableData && estimateData.tableData.length > 0) {
      // 각 상품의 가격 합산
      productTotal = estimateData.tableData.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return sum + price * quantity;
      }, 0);
    }

    // 계산된 값들 설정
    const paymentInfo = estimateData.paymentInfo || {};
    const laborCost = paymentInfo.laborCost || 0;
    const tuningCost = paymentInfo.tuningCost || 0;
    const setupCost = paymentInfo.setupCost || 0;
    const warrantyFee = paymentInfo.warrantyFee || 0;
    const discount = paymentInfo.discount || 0;
    const shippingCost = paymentInfo.shippingCost || 0;
    const includeVat = paymentInfo.includeVat !== undefined ? paymentInfo.includeVat : true;
    const vatRate = paymentInfo.vatRate !== undefined ? paymentInfo.vatRate : 10;

    // 총 구매 금액 계산 (VAT 제외)
    const totalBeforeVat =
      productTotal + laborCost + tuningCost + setupCost + warrantyFee + shippingCost - discount;

    // VAT 금액 계산
    const vatAmount = includeVat ? (totalBeforeVat * vatRate) / 100 : 0;

    // 최종 결제 금액
    const finalPayment = totalBeforeVat + vatAmount;

    // 계산된 값 저장
    estimateData.calculatedValues = {
      productTotal,
      totalPurchase: totalBeforeVat,
      vatAmount,
      finalPayment,
    };

    // 새 견적 생성
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
