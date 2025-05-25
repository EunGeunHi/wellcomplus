import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { withAuthAPI } from '../../middleware';

/**
 * 리뷰 이미지 클라이언트 업로드용 토큰 생성 API
 * 이미지를 서버를 거치지 않고 직접 Vercel Blob Storage에 업로드하기 위한 토큰을 생성
 */
async function handler(req, { session }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: '지원하지 않는 메서드입니다.' }, { status: 405 });
  }

  try {
    const body = await req.json();

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // 사용자 인증 확인
        if (!session?.user?.id) {
          throw new Error('인증이 필요합니다.');
        }

        // 리뷰 이미지 파일 타입 및 크기 제한 설정
        return {
          allowedContentTypes: ['image/jpeg', 'image/png'],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB 제한
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            uploadedAt: new Date().toISOString(),
            type: 'review-image',
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // 업로드 완료 시 로그 기록
        console.log('리뷰 이미지 업로드 완료:', {
          url: blob.url,
          size: blob.size,
          tokenPayload: JSON.parse(tokenPayload || '{}'),
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('리뷰 이미지 토큰 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '토큰 생성 중 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}

export const POST = withAuthAPI(handler);
