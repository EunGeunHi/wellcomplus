import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from './auth/[...nextauth]/route';

/**
 * API 라우트에 권한 검증을 추가하는 미들웨어
 * 로그인 상태만 검증
 * @param {Function} handler - API 핸들러 함수
 * @returns {Function} - 권한 검증이 추가된 새 핸들러 함수
 */
export function withAuthAPI(handler) {
  return async (req, context) => {
    const session = await getServerSession(authOptions);

    // 인증되지 않은 요청 거부
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    // 핸들러에 세션 정보 전달
    return handler(req, { ...context, session });
  };
}

/**
 * "king" 권한이 있는 사용자만 접근할 수 있는 API 미들웨어
 * @param {Function} handler - API 핸들러 함수
 * @returns {Function} - "king" 권한 검증이 추가된 새 핸들러 함수
 */
export function withKingAuthAPI(handler) {
  return async (req, context) => {
    const session = await getServerSession(authOptions);

    // 디버깅을 위한 세션 로그 출력
    //console.log('Session in middleware:', JSON.stringify(session));

    // 인증되지 않은 요청 거부
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    // 권한 확인을 위한 로그
    //console.log('Authority:', session.user?.authority);

    // "king" 권한이 없는 요청 거부
    if (!session.user || session.user.authority !== 'king') {
      return NextResponse.json(
        {
          error: '접근 권한이 없습니다.',
          debug: {
            hasUser: Boolean(session.user),
            authority: session.user?.authority || 'none',
          },
        },
        { status: 403 }
      );
    }

    // 핸들러에 세션 정보 전달
    return handler(req, { ...context, session });
  };
}
