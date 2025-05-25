import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withKingAuthAPI } from '@/app/api/middleware';
import { deleteFileFromBlob } from '@/lib/application-blob-storage';

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

    // Blob Storage URL로 리다이렉트
    if (file.url) {
      return NextResponse.redirect(file.url);
    } else {
      return NextResponse.json({ error: '파일 URL을 찾을 수 없습니다.' }, { status: 404 });
    }
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

    // Blob Storage에서 파일 삭제
    const fileToDelete = application.files[fileIndex];
    if (fileToDelete.url) {
      try {
        await deleteFileFromBlob(fileToDelete.url);
      } catch (error) {
        console.error('Blob Storage 파일 삭제 오류:', error);
        // Blob 삭제 실패해도 DB에서는 제거 진행
      }
    }

    // 파일 삭제
    application.files.splice(fileIndex, 1);
    await application.save();

    // 업데이트된 파일 목록 반환
    const fileInfos = application.files.map((file) => ({
      id: file._id,
      url: file.url,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      uploadedAt: file.uploadedAt,
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
