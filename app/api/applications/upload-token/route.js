import { NextResponse } from 'next/server';
import { uploadFileToCloudinary } from '../../../../lib/application-storage.js';

/**
 * 신청서 파일 업로드 API (Cloudinary 사용)
 * POST /api/applications/upload-token
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    const applicationId = formData.get('applicationId');

    if (!file || !userId || !applicationId) {
      return NextResponse.json(
        { error: '파일, 사용자 ID, 신청서 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 검증 (위험한 확장자 차단)
    const fileName = file.name.toLowerCase();
    const blockedExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.msi', '.dll'];
    const hasBlockedExtension = blockedExtensions.some((ext) => fileName.endsWith(ext));

    if (hasBlockedExtension) {
      return NextResponse.json(
        { error: '보안상 실행 파일(.exe, .bat, .cmd 등)은 업로드할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 허용된 확장자 검증
    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp', // 이미지
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx', // 문서
      '.txt',
      '.rtf', // 텍스트
      '.zip',
      '.rar',
      '.7z', // 압축
      '.mp4',
      '.avi',
      '.mov',
      '.wmv', // 비디오
      '.mp3',
      '.wav',
      '.flac', // 오디오
    ];

    const hasAllowedExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasAllowedExtension) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. 이미지, 문서, 압축 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Cloudinary에 파일 업로드
    const uploadResult = await uploadFileToCloudinary(file, userId, applicationId, file.name);

    return NextResponse.json({
      success: true,
      file: uploadResult,
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { error: error.message || '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
