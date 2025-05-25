import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import { withAuthAPI } from '../../middleware';

async function handler(req, { session }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: '지원하지 않는 메서드입니다.' }, { status: 405 });
  }
  try {
    await connectDB();

    // JSON 데이터 처리 (클라이언트 업로드 방식)
    const body = await req.json();

    // 폼 데이터에서 필드 추출
    const {
      files = [], // 클라이언트에서 이미 업로드된 파일 정보
      purpose,
      budget,
      printType,
      infiniteInk,
      outputColor,
      additionalRequests,
      phoneNumber,
      deliveryMethod,
      address,
    } = body;

    // 필수 필드 검증
    if (!purpose || !budget || !phoneNumber) {
      return NextResponse.json(
        { error: '사용 목적, 예산, 연락처는 필수로 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // 파일 개수 검증 (클라이언트에서 업로드된 파일)
    if (files && files.length > 5) {
      return NextResponse.json(
        { error: '파일은 최대 5개까지만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 신청서 생성 (클라이언트에서 업로드된 파일 정보 포함)
    const application = new Application({
      type: 'printer',
      userId: session.user.id,
      files: files || [], // 클라이언트에서 업로드된 파일 정보
      printer_information: {
        purpose: purpose,
        budget: budget,
        printerType: printType || '',
        infiniteInk: infiniteInk || '',
        outputColor: outputColor || '',
        additionalRequests: additionalRequests || '',
        phoneNumber: phoneNumber?.trim().length > 0 ? phoneNumber : user.phoneNumber || '',
        deliveryMethod: deliveryMethod || '',
        address: address || '',
      },
    });

    // 신청서 저장
    await application.save();

    return NextResponse.json(
      {
        message: '견적 신청이 완료되었습니다.',
        application: {
          id: application._id,
          type: application.type,
          status: application.status,
          createdAt: application.createdAt,
          files: application.files.map((file) => ({
            id: file._id,
            url: file.url,
            filename: file.filename,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            uploadedAt: file.uploadedAt,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const POST = withAuthAPI(handler);
