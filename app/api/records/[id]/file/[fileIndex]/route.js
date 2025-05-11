import { NextResponse } from 'next/server';
import Record from '@/models/Record';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { withKingAuthAPI } from '@/app/api/middleware';

// GET /api/records/[id]/file/[fileIndex] - 특정 레코드의 특정 파일 다운로드
async function fileDownloadHandler(req, { params }) {
  try {
    // 데이터베이스 연결
    await connectDB();

    const { id, fileIndex } = params;
    const fileIndexNum = parseInt(fileIndex);

    // ID 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: '유효하지 않은 레코드 ID입니다.' }, { status: 400 });
    }

    // 인덱스 유효성 검사
    if (isNaN(fileIndexNum) || fileIndexNum < 0) {
      return NextResponse.json({ error: '유효하지 않은 파일 인덱스입니다.' }, { status: 400 });
    }

    // 레코드 조회
    const record = await Record.findById(id);

    if (!record) {
      return NextResponse.json({ error: '레코드를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 존재 여부 확인
    if (!record.file || !record.file[fileIndexNum]) {
      return NextResponse.json({ error: '요청한 파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    const file = record.file[fileIndexNum];

    // 파일 다운로드 응답 생성
    const response = new NextResponse(file.data);

    // Content-Type 및 Content-Disposition 헤더 설정
    response.headers.set('Content-Type', file.contentType || 'application/octet-stream');
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.fileName)}"`
    );

    return response;
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return NextResponse.json({ error: '파일 다운로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const GET = withKingAuthAPI(fileDownloadHandler);
