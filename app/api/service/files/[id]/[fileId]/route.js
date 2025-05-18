import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withKingAuthAPI } from '@/app/api/middleware';

/**
 * 파일 다운로드 API
 * 특정 서비스 신청에 첨부된 파일을 다운로드
 */
export const GET = withKingAuthAPI(async (req, { params }) => {
  try {
    // URL에서 ID와 파일 인덱스 추출
    const { id, fileId } = params;
    const fileIndex = parseInt(fileId);

    // 파일 인덱스 검증
    if (isNaN(fileIndex)) {
      return NextResponse.json({ error: '잘못된 파일 인덱스입니다.' }, { status: 400 });
    }

    // MongoDB 연결
    await connectDB();

    // 애플리케이션 찾기
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: '해당 서비스 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 존재 여부 확인
    if (!application.files || !application.files[fileIndex]) {
      return NextResponse.json({ error: '해당 파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 다운로드
    const file = application.files[fileIndex];

    // 응답 헤더 설정 및 파일 데이터 반환
    const headers = new Headers();
    headers.set('Content-Type', file.contentType);

    // RFC 5987에 따라 파일명 인코딩 처리
    // ASCII 문자면 따옴표로 감싸고, 아니면 UTF-8로 인코딩
    const filenameAscii = /^[\x00-\x7F]*$/.test(file.fileName);
    const filenameForHeader = filenameAscii
      ? `"${file.fileName}"`
      : `UTF-8''${encodeURIComponent(file.fileName)}`;

    headers.set('Content-Disposition', `attachment; filename=${filenameForHeader}`);
    headers.set('Content-Length', file.data.length.toString());

    // 파일 데이터 전송
    return new NextResponse(file.data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('파일 다운로드 중 오류:', error);
    return NextResponse.json({ error: '파일 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
});

/**
 * 파일 삭제 API
 * 특정 서비스 신청에 첨부된 파일을 삭제
 */
export const DELETE = withKingAuthAPI(async (req, { params }) => {
  try {
    // URL에서 ID와 파일 인덱스 추출
    const { id, fileId } = params;
    const fileIndex = parseInt(fileId);

    // 파일 인덱스 검증
    if (isNaN(fileIndex)) {
      return NextResponse.json({ error: '잘못된 파일 인덱스입니다.' }, { status: 400 });
    }

    // MongoDB 연결
    await connectDB();

    // 애플리케이션 찾기
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: '해당 서비스 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 존재 여부 확인
    if (!application.files || !application.files[fileIndex]) {
      return NextResponse.json({ error: '해당 파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 삭제
    application.files.splice(fileIndex, 1);
    await application.save();

    // 업데이트된 파일 목록 반환 (바이너리 데이터 제외)
    const fileInfos = application.files.map((file) => ({
      fileName: file.fileName,
      fileSize: file.fileSize,
      contentType: file.contentType,
    }));

    return NextResponse.json({
      message: '파일이 성공적으로 삭제되었습니다.',
      files: fileInfos,
    });
  } catch (error) {
    console.error('파일 삭제 중 오류:', error);
    return NextResponse.json({ error: '파일 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
});
