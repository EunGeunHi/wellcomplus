import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withKingAuthAPI } from '@/app/api/middleware';

/**
 * 파일 업로드 API
 * 특정 서비스 신청에 파일 첨부
 */
export const POST = withKingAuthAPI(async (req, { params }) => {
  try {
    // URL에서 ID 추출
    const { id } = params;

    // MongoDB 연결
    await connectDB();

    // 애플리케이션 존재 여부 확인
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: '해당 서비스 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    // FormData에서 파일 데이터 추출
    const formData = await req.formData();
    const files = formData.getAll('files');

    // 파일이 있는지 확인
    if (!files || files.length === 0) {
      return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    // 파일 처리
    const newFiles = [];
    for (const file of files) {
      // File 객체 확인
      if (!(file instanceof File)) {
        continue;
      }

      // 파일 크기 제한 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          { error: '개별 파일 크기는 2MB를 초과할 수 없습니다.' },
          { status: 400 }
        );
      }

      // 파일 데이터 읽기
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 파일 정보 저장
      newFiles.push({
        data: buffer,
        contentType: file.type,
        fileName: file.name,
        fileSize: file.size,
      });
    }

    // 현재 파일 목록에 새 파일 추가
    const existingFiles = application.files || [];
    application.files = [...existingFiles, ...newFiles];

    // 총 파일 크기 검증
    const totalFileSize = application.files.reduce((sum, file) => sum + file.fileSize, 0);
    if (totalFileSize > 2 * 1024 * 1024) {
      return NextResponse.json({ error: '총 파일 크기가 2MB를 초과합니다.' }, { status: 400 });
    }

    // 저장
    await application.save();

    // 파일 정보 반환 (바이너리 데이터 제외)
    const fileInfos = application.files.map((file) => ({
      fileName: file.fileName,
      fileSize: file.fileSize,
      contentType: file.contentType,
    }));

    return NextResponse.json({
      message: '파일이 성공적으로 업로드되었습니다.',
      files: fileInfos,
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json({ error: '파일 업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
});
