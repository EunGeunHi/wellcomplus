'use client';

import { useSession } from 'next-auth/react';

/**
 * 사용자가 "king" 권한을 가지고 있는지 확인하는 함수
 * @param {Object} session - 세션 객체
 * @returns {boolean} - "king" 권한이 있으면 true, 없으면 false
 */
function isKing(session) {
  if (!session || !session.user) return false;
  return session.user.authority === 'king';
}

/**
 * 전체 페이지를 보호하는 대신 특정 섹션만 보호하고 싶을 때 사용하는 컴포넌트
 */
export function KingOnlySection({ children, fallback }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100/50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-[BMJUA] text-gray-700">잠시만 기다려주세요...</h2>
            <p className="text-gray-500">관리자 권한을 확인하는 중입니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isKing(session)) {
    return <>{children}</>;
  }

  // 대체 컨텐츠가 제공되면 표시, 아니면 null
  return fallback ? <>{fallback}</> : null;
}

/**
 * 로그인한 사용자에게만 컨텐츠를 표시하는 컴포넌트
 * @param {ReactNode} children - 보호된 컨텐츠
 * @param {ReactNode} fallback - 로그인하지 않은 사용자에게 보여줄 대체 컨텐츠 (선택 사항)
 */
export function LoggedInOnlySection({ children, fallback }) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-blue-100/50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-[BMJUA] text-gray-700">잠시만 기다려주세요...</h2>
            <p className="text-gray-500">페이지를 불러오는 중입니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <>{children}</>;
  }

  // 대체 컨텐츠가 제공되면 표시, 아니면 null
  return fallback ? <>{fallback}</> : null;
}

/**
 * 사용자 인증 상태를 표시하는 컴포넌트
 */
export function AuthStatus() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  if (status === 'loading') {
    return <div className="p-3 bg-gray-100 rounded-lg">인증 상태 확인 중...</div>;
  }

  return (
    <div className="p-3 bg-gray-100 rounded-lg">
      <p>현재 상태: {isLoggedIn ? '로그인됨' : '로그아웃 상태'}</p>
      {isLoggedIn && (
        <>
          <p>사용자: {session.user.name || session.user.email}</p>
          {session.user.authority === 'king' && (
            <p className="text-purple-600 font-semibold">관리자 권한이 있습니다.</p>
          )}
        </>
      )}
    </div>
  );
}
