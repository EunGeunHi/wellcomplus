import { NextResponse } from 'next/server';

export function middleware(request) {
  // 환경변수로 유지보수 모드 제어
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    // 유지보수 모드 - 모든 요청 차단
    return new NextResponse(
      JSON.stringify({
        error: 'Service temporarily unavailable for maintenance',
        message: '관리자에의해 서비스가 일시적으로 중단되었습니다.',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '3600',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }

  // 정상 모드 - 요청 통과
  return NextResponse.next();
}

// 모든 경로에 미들웨어 적용 (정적 파일 제외)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
