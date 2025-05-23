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
    const asCategory = formData.get('asCategory');
    const userName = formData.get('userName');
    const pcNumber = formData.get('pcNumber');
    const printerType = formData.get('printerType');
    const infiniteInk = formData.get('infiniteInk');
    const description = formData.get('description');
    const phoneNumber = formData.get('phoneNumber');
    const deliveryMethod = formData.get('deliveryMethod');
    const address = formData.get('address');

    // 필수 필드 검증
    if (!asCategory || !description || !phoneNumber) {
      return NextResponse.json(
        { error: '제품 종류, 문제 설명, 연락처는 필수로 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 전화번호 처리
    const finalPhoneNumber = phoneNumber || user.phoneNumber || '';

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

    // A/S 신청 생성
    const application = await Application.create({
      type: 'as',
      userId: session.user.id,
      files: fileData,
      as_information: {
        asCategory,
        userName: userName || '',
        pcNumber: pcNumber || '',
        printerType: printerType || '',
        infiniteInk: infiniteInk || '',
        description,
        phoneNumber: finalPhoneNumber,
        deliveryMethod: deliveryMethod || '',
        address: address || '',
      },
    });

    return NextResponse.json(
      { message: 'A/S 신청이 완료되었습니다.', application },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in A/S application:', error);
    return NextResponse.json({ error: 'A/S 신청 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const POST = withAuthAPI(handler);
