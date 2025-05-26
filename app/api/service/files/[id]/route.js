import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withKingAuthAPI } from '@/app/api/middleware';
import { uploadFileToCloudinary, validateFileCount } from '@/lib/application-storage';

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

    // 실제 파일만 필터링
    const validFiles = files.filter((file) => file instanceof File && file.size > 0);

    if (validFiles.length === 0) {
      return NextResponse.json({ error: '업로드할 유효한 파일이 없습니다.' }, { status: 400 });
    }

    // 현재 파일 개수와 새 파일 개수 합계 검증
    const currentFileCount = application.files ? application.files.length : 0;
    if (currentFileCount + validFiles.length > 5) {
      return NextResponse.json(
        { error: '파일은 최대 5개까지만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 업로드
    const uploadedFiles = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const uploadedFile = await uploadFileToCloudinary(file, 'admin', id, file.name);
      uploadedFiles.push(uploadedFile);
    }

    // 현재 파일 목록에 새 파일 추가
    const existingFiles = application.files || [];
    application.files = [...existingFiles, ...uploadedFiles];

    // 저장
    await application.save();

    // 파일 정보 반환
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
      message: '파일이 성공적으로 업로드되었습니다.',
      files: fileInfos,
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json({ error: '파일 업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
});
