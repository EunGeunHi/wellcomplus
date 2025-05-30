import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withAuthAPI } from '@/app/api/middleware';

async function handler(request, { params, session }) {
  try {
    const { id } = params;

    // MongoDB 연결
    await connectDB();

    // 신청 정보 조회 - 필요한 필드만 선택적으로 조회
    const application = await Application.findById(id)
      .select(
        `
        type status createdAt updatedAt comment
        computer_information printer_information notebook_information 
        as_information inquiry_information files userId
      `
      )
      .lean();

    if (!application) {
      return NextResponse.json({ error: '신청 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 권한 확인 - 본인이거나 관리자만 접근 가능
    if (application.userId.toString() !== session.user.id && session.user.authority !== 'king') {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    // 파일 정보 최적화 - 다운로드에 필요한 정보만 포함
    if (application.files && application.files.length > 0) {
      application.files = application.files.map((file, index) => ({
        _id: file._id,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
        downloadIndex: index, // 다운로드용 인덱스 추가
      }));
    }

    // 응답 데이터 구성 - 타입별 정보만 포함
    const responseData = {
      _id: application._id,
      type: application.type,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      comment: application.comment,
      files: application.files || [],
    };

    // 타입별 정보 추가 (해당하는 정보만)
    switch (application.type) {
      case 'computer':
        responseData.computer_information = application.computer_information;
        break;
      case 'printer':
        responseData.printer_information = application.printer_information;
        break;
      case 'notebook':
        responseData.notebook_information = application.notebook_information;
        break;
      case 'as':
        responseData.as_information = application.as_information;
        break;
      case 'inquiry':
        responseData.inquiry_information = application.inquiry_information;
        break;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('신청 상세 정보 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '신청 정보를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// withAuthAPI 미들웨어 적용
export const GET = withAuthAPI(handler);
