import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Record from '@/models/Record';
import { withKingAuthAPI } from '../middleware';

// POST 요청 처리 - 새 레코드 생성
async function handler(req) {
  try {
    await connectDB();

    // FormData에서 데이터 추출
    const formData = await req.formData();

    // 기본 필드 추출
    const title = formData.get('title');
    const name = formData.get('name');
    const content = formData.get('content');
    const category = formData.get('category') || '없음';

    // 제목은 필수 입력 필드
    if (!title) {
      return NextResponse.json({ error: '제목은 필수 입력 항목입니다.' }, { status: 400 });
    }

    // 카테고리 유효성 검사
    if (!['자료', '기록', '없음'].includes(category)) {
      return NextResponse.json({ error: '유효하지 않은 카테고리입니다.' }, { status: 400 });
    }

    // 새 레코드 객체 생성
    const newRecord = {
      title,
      name: name || '',
      content: content || '',
      category,
      file: [],
    };

    // 파일 처리 - 여러 파일 지원
    const files = formData.getAll('files');
    if (files && files.length > 0) {
      for (const file of files) {
        if (file instanceof File) {
          // 파일을 ArrayBuffer로 변환 후 Buffer로 변환
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // 파일 정보 추가
          newRecord.file.push({
            data: buffer,
            contentType: file.type,
            fileName: file.name,
            fileSize: file.size,
          });
        }
      }
    }

    // 데이터베이스에 저장
    const record = await Record.create(newRecord);

    return NextResponse.json(
      {
        message: '레코드가 생성되었습니다.',
        recordId: record._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('레코드 생성 오류:', error);
    return NextResponse.json({ error: '레코드 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const POST = withKingAuthAPI(handler);
