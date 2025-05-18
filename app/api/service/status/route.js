import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withKingAuthAPI } from '@/app/api/middleware';

/**
 * 서비스 신청 상태 변경 API
 * 관리자만 접근 가능
 */
export const PATCH = withKingAuthAPI(async (req, { session }) => {
  try {
    const { id, status, comment } = await req.json();

    // 필수 필드 확인
    if (!id || !status) {
      return NextResponse.json(
        { error: '신청 ID와 변경할 상태는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // 유효한 status 값인지 확인
    const validStatus = ['apply', 'in_progress', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태 값입니다.' }, { status: 400 });
    }

    // MongoDB 연결
    await connectDB();

    // 해당 서비스 신청 조회
    const application = await Application.findById(id);

    if (!application) {
      return NextResponse.json({ error: '해당 서비스 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 상태 업데이트
    application.status = status;

    // 코멘트가 있으면 업데이트
    if (comment !== undefined) {
      application.comment = comment;
    }

    // 업데이트 시간 갱신
    application.updatedAt = new Date();

    // 저장
    await application.save();

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '서비스 신청 상태가 성공적으로 변경되었습니다.',
      application: {
        id: application._id,
        status: application.status,
        comment: application.comment,
        updatedAt: application.updatedAt,
      },
    });
  } catch (error) {
    console.error('서비스 신청 상태 변경 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
