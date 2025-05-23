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

    // FormData 처리
    const formData = await req.formData();

    // 폼 데이터에서 파일 및 필드 추출
    const files = formData.getAll('files');
    const purpose = formData.get('purpose');
    const budget = formData.get('budget');
    const cpu = formData.get('cpu');
    const gpu = formData.get('gpu');
    const memory = formData.get('memory');
    const storage = formData.get('storage');
    const cooling = formData.get('cooling');
    const os = formData.get('os');
    const additionalRequests = formData.get('additionalRequests');
    const phoneNumber = formData.get('phoneNumber');
    const deliveryMethod = formData.get('deliveryMethod');
    const address = formData.get('address');

    // 필수 필드 검증
    if (!purpose || !budget || !os || !phoneNumber) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 사용자 정보 조회
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 데이터 처리
    const fileData = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fileData.push({
        data: buffer,
        contentType: file.type,
        fileName: file.name,
        fileSize: file.size,
      });
    }

    // 신청서 생성
    const application = await Application.create({
      type: 'computer',
      userId: session.user.id,
      files: fileData,
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

    return NextResponse.json(
      { message: '견적 신청이 완료되었습니다.', application },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const POST = withAuthAPI(handler);
