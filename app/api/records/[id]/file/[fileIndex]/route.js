import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Record from '@/models/Record';
import { withKingAuthAPI } from '../../../../middleware';
import mongoose from 'mongoose';

// GET 요청 처리 - 파일 다운로드
async function handler(req, { params }) {
  try {
    await connectDB();

    const { id, fileIndex } = params;
    const index = parseInt(fileIndex);

    // ID 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: '유효하지 않은 레코드 ID입니다.' }, { status: 400 });
    }

    // 레코드 조회
    const record = await Record.findById(id);

    if (!record) {
      return NextResponse.json({ error: '레코드를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 존재 여부 확인
    if (!record.file || !record.file[index]) {
      return NextResponse.json({ error: '요청한 파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    const file = record.file[index];

    // 파일 데이터 확인
    if (!file.data) {
      return NextResponse.json({ error: '파일 데이터가 없습니다.' }, { status: 404 });
    }

    // 파일 다운로드를 위한 응답 생성
    const response = new NextResponse(file.data, {
      status: 200,
      headers: {
        'Content-Type': file.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.fileName)}"`,
        'Content-Length': file.fileSize ? file.fileSize.toString() : file.data.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return NextResponse.json({ error: '파일 다운로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const GET = withKingAuthAPI(handler);
