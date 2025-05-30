import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withAuthAPI } from '../../../../middleware';

async function handler(req, { session, params }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: '지원하지 않는 메서드입니다.' }, { status: 405 });
  }

  try {
    await connectDB();

    const { id, index } = params;
    const fileIndex = parseInt(index);

    // 신청서 찾기
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: '신청 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자 권한 확인 (본인이거나 관리자만 접근 가능)
    if (application.userId.toString() !== session.user.id && session.user.authority !== 'king') {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    // 파일 데이터 확인
    if (!application.files || !application.files[fileIndex]) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    const file = application.files[fileIndex];

    // Blob Storage URL로 리다이렉트
    if (file.url) {
      return NextResponse.redirect(file.url);
    } else {
      return NextResponse.json({ error: '파일 URL을 찾을 수 없습니다.' }, { status: 404 });
    }
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const GET = withAuthAPI(handler);
