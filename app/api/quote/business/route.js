import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuoteAnnouncement from '@/models/QuoteAnnouncement';
import { withKingAuthAPI } from '@/app/api/middleware';

// 기업용 견적서 공지사항 조회 (관리자 권한 필요)
export const GET = withKingAuthAPI(async (request, { session }) => {
  try {
    await connectDB();

    // 기업용 공지사항 조회 (최신 문서 하나만)
    const announcement = await QuoteAnnouncement.findOne({ type: 'business' })
      .sort({ updatedAt: -1 })
      .exec();

    if (!announcement) {
      return NextResponse.json({
        success: true,
        announcement:
          '본 견적서는 수급상황에 따라, 금액과 부품이 대체/변동 될 수 있습니다.\n상품의 사양 및 가격은 제조사의 정책에 따라 변경될 수 있습니다.\n계약금 입금 후 주문이 확정됩니다.\n부가세는 별도입니다.',
      });
    }

    return NextResponse.json({
      success: true,
      announcement: announcement.content,
    });
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return NextResponse.json({ error: '공지사항 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
});

// 기업용 견적서 공지사항 수정 (관리자 권한 필요)
export const POST = withKingAuthAPI(async (request, { session }) => {
  try {
    await connectDB();

    const data = await request.json();
    const { announcement } = data;

    if (!announcement || typeof announcement !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 공지사항 데이터입니다.',
        },
        { status: 400 }
      );
    }

    // 최신 기업용 공지사항 조회
    let existingAnnouncement = await QuoteAnnouncement.findOne({ type: 'business' })
      .sort({ updatedAt: -1 })
      .exec();

    if (existingAnnouncement) {
      // 기존 공지사항 업데이트
      existingAnnouncement.content = announcement;
      existingAnnouncement.updatedAt = new Date();
      await existingAnnouncement.save();
    } else {
      // 새 공지사항 생성
      await QuoteAnnouncement.create({
        type: 'business',
        content: announcement,
      });
    }

    return NextResponse.json({
      success: true,
      message: '공지사항이 성공적으로 저장되었습니다.',
    });
  } catch (error) {
    console.error('공지사항 저장 오류:', error);
    return NextResponse.json({ error: '공지사항 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
});
