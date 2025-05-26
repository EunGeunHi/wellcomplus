import { NextResponse } from 'next/server';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { withAuthAPI } from '@/app/api/middleware';

/**
 * Cloudinary 파일 삭제 API (모든 파일 타입 지원)
 * DELETE /api/cloudinary/delete
 * 인증된 사용자만 접근 가능
 */
async function handler(request, { session }) {
  try {
    const body = await request.json();
    const { cloudinaryId } = body;

    if (!cloudinaryId) {
      return NextResponse.json({ error: 'Cloudinary ID가 필요합니다.' }, { status: 400 });
    }

    // Cloudinary에서 파일 삭제 (모든 파일 타입 지원)
    const result = await deleteFromCloudinary(cloudinaryId);

    return NextResponse.json({
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
      result,
    });
  } catch (error) {
    console.error('Cloudinary 파일 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '파일 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export const DELETE = withAuthAPI(handler);
