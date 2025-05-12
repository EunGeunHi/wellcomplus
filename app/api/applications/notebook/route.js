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
    const modelName = formData.get('modelName');
    const manufacturer = formData.get('manufacturer');
    const brand = formData.get('brand');
    const screenSize = formData.get('screenSize');
    const cpuType = formData.get('cpuType');
    const gpuType = formData.get('gpuType');
    const ramSize = formData.get('ramSize');
    const storageSize = formData.get('storageSize');
    const os = formData.get('os');
    const weight = formData.get('weight');
    const priceRange = formData.get('priceRange');
    const purpose = formData.get('purpose');
    const additionalRequests = formData.get('additionalRequests');
    const phoneNumber = formData.get('phoneNumber');

    // 필수 필드 검증
    if (!purpose || !os || !phoneNumber) {
      return NextResponse.json(
        { error: '용도, 운영체제, 연락처는 필수로 입력해야 합니다.' },
        { status: 400 }
      );
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
      type: 'notebook',
      userId: session.user.id,
      files: fileData,
      notebook_information: {
        modelName: modelName || '',
        manufacturer: manufacturer || '',
        brand: brand || '',
        screenSize: screenSize || '',
        cpuType: cpuType || '',
        gpuType: gpuType || '',
        ramSize: ramSize || '',
        storageSize: storageSize || '',
        os: os,
        weight: weight || '',
        priceRange: priceRange || '',
        purpose: purpose,
        additionalRequests: additionalRequests || '',
        phoneNumber: phoneNumber?.trim().length > 0 ? phoneNumber : user.phoneNumber || '',
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
