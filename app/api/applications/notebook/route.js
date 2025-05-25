import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import { withAuthAPI } from '../../middleware';
import { uploadFileToBlob, validateFileCount } from '@/lib/application-blob-storage';

async function handler(req, { session }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: '지원하지 않는 메서드입니다.' }, { status: 405 });
  }
  try {
    await connectDB();

    // FormData 처리
    const formData = await req.formData();

    // 폼 데이터에서 파일 및 필드 추출
    const files = formData.getAll('files');
    const purpose = formData.get('purpose');
    const budget = formData.get('budget');
    const cpu = formData.get('cpu');
    const gpu = formData.get('gpu');
    const weight = formData.get('weight');
    const os = formData.get('os');
    const ram = formData.get('ram');
    const storage = formData.get('storage');
    const additionalRequests = formData.get('additionalRequests');
    const phoneNumber = formData.get('phoneNumber');
    const deliveryMethod = formData.get('deliveryMethod');
    const address = formData.get('address');

    // 필수 필드 검증
    if (!purpose || !budget || !phoneNumber) {
      return NextResponse.json(
        { error: '용도, 예산, 연락처는 필수로 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 임시 신청서 생성 (파일 없이)
    const tempApplication = new Application({
      type: 'notebook',
      userId: session.user.id,
      files: [], // 빈 배열로 시작
      notebook_information: {
        purpose: purpose,
        budget: budget,
        cpu: cpu || '',
        gpu: gpu || '',
        weight: weight || '',
        os: os || '',
        ram: ram || '',
        storage: storage || '',
        additionalRequests: additionalRequests || '',
        phoneNumber: phoneNumber?.trim().length > 0 ? phoneNumber : user.phoneNumber || '',
        deliveryMethod: deliveryMethod || '',
        address: address || '',
      },
    });

    // 임시 저장하여 신청서 ID 생성
    await tempApplication.save();
    const applicationId = tempApplication._id.toString();

    // 파일 처리
    const uploadedFiles = [];
    if (files && files.length > 0) {
      // 실제 파일만 필터링 (빈 파일 제외)
      const validFiles = files.filter((file) => file.size > 0);

      if (validFiles.length > 0) {
        try {
          // 파일 개수 검증
          validateFileCount(validFiles);

          // 각 파일을 Vercel Blob Storage에 업로드
          for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            const uploadedFile = await uploadFileToBlob(file, applicationId, i);
            uploadedFiles.push(uploadedFile);
          }
        } catch (error) {
          // 업로드 실패 시 임시 신청서 삭제
          await Application.findByIdAndDelete(applicationId);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
    }

    // 신청서에 파일 정보 업데이트
    tempApplication.files = uploadedFiles;
    await tempApplication.save();

    return NextResponse.json(
      {
        message: '견적 신청이 완료되었습니다.',
        application: {
          id: tempApplication._id,
          type: tempApplication.type,
          status: tempApplication.status,
          createdAt: tempApplication.createdAt,
          files: tempApplication.files.map((file) => ({
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
