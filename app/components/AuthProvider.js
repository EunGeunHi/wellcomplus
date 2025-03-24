'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Auth.js 세션 제공자 컴포넌트
 *
 * 애플리케이션 전체에 Auth.js의 세션 정보를 제공
 * useSession 훅을 사용할 수 있게 함
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 */
export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
