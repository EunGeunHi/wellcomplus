import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import { withAuthAPI } from '../../middleware';
import { deleteMultipleFilesFromCloudinary } from '@/lib/application-storage';

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
      cpu,
      gpu,
      memory,
      storage,
      cooling,
      os,
      additionalRequests,
      phoneNumber,
      deliveryMethod,
      address,
    } = body;

    // 필수 필드 검증
    if (!purpose || !budget || !os || !phoneNumber) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 사용자 정보 조회
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 개수 검증 (클라이언트에서 업로드된 파일)
    if (files && files.length > 5) {
      return NextResponse.json(
        { error: '파일은 최대 5개까지만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 신청서 생성 (클라이언트에서 업로드된 파일 정보 포함)
    const application = new Application({
      type: 'computer',
      userId: session.user.id,
      files: files || [], // 클라이언트에서 업로드된 파일 정보
      computer_information: {
        purpose: purpose,
        budget: budget,
        cpu: cpu || '',
        gpu: gpu || '',
        memory: memory || '',
        storage: storage || '',
        cooling: cooling || '',
        os: os,
        additionalRequests: additionalRequests || '',
        phoneNumber: phoneNumber?.trim().length > 0 ? phoneNumber : user.phoneNumber || '',
        deliveryMethod: deliveryMethod || '',
        address: address || '',
      },
    });

    // 신청서 저장 (실패 시 Cloudinary 파일 롤백)
    try {
      await application.save();
    } catch (saveError) {
      // MongoDB 저장 실패 시 Cloudinary에서 업로드된 파일들 삭제
      if (files && files.length > 0) {
        try {
          console.log('MongoDB 저장 실패, Cloudinary 파일 롤백 시작...');
          const cloudinaryIds = files.map((file) => file.cloudinaryId).filter((id) => id);
          if (cloudinaryIds.length > 0) {
            await deleteMultipleFilesFromCloudinary(cloudinaryIds);
          }
          console.log('Cloudinary 파일 롤백 완료');
        } catch (rollbackError) {
          console.error('Cloudinary 롤백 실패:', rollbackError);
          // 롤백 실패는 로그만 남기고 원본 에러를 던짐
        }
      }
      throw saveError; // 원본 에러를 다시 던져서 클라이언트에 전달
    }

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
