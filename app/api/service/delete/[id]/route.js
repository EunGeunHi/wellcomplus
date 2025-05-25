import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withKingAuthAPI } from '@/app/api/middleware';
import { deleteApplicationFilesFromBlob } from '@/lib/application-blob-storage';

/**
 * 애플리케이션 완전 삭제 API
 * 취소 상태의 애플리케이션만 삭제 가능
 * 관리자만 접근 가능
 */
export const DELETE = withKingAuthAPI(async (req, { params }) => {
  try {
    const { id } = params;

    // MongoDB 연결
    await connectDB();

    // 애플리케이션 조회
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: '해당 서비스 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 취소 상태인지 확인
    if (application.status !== 'cancelled') {
      return NextResponse.json(
        { error: '취소 상태의 신청만 완전 삭제할 수 있습니다.' },
        { status: 400 }
      );
    }

    // Blob Storage에서 모든 파일 삭제
    if (application.files && application.files.length > 0) {
      try {
        await deleteApplicationFilesFromBlob(application.files);
      } catch (error) {
        console.error('Blob Storage 파일 삭제 오류:', error);
        // Blob 삭제 실패해도 DB 삭제는 진행
      }
    }

    // MongoDB에서 애플리케이션 완전 삭제
    await Application.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: '서비스 신청이 완전히 삭제되었습니다.',
    });
  } catch (error) {
    console.error('애플리케이션 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
