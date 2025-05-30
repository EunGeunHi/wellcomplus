'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { KingOnlySection } from './ProtectedContent';

/**
 * 네비게이션 바 컴포넌트
 * 사용자 인증 상태에 따라 다른 메뉴 표시
 */
export default function Navigation() {
  // 메뉴 상태 관리
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 모바일 메뉴 토글 상태
  const [scrolled, setScrolled] = useState(false); // 스크롤 상태
  const [userName, setUserName] = useState(''); // 사용자 이름을 상태로 관리

  // Auth.js 세션 정보 가져오기
  const { data: session, status, update: updateSession } = useSession();
  const isLoading = status === 'loading'; // 세션 로딩 중 상태

  // 세션 정보가 변경될 때마다 사용자 이름 업데이트
  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session]);

  // 주기적으로 세션 갱신 (30초마다)
  useEffect(() => {
    const refreshSessionData = async () => {
      if (session) {
        try {
          await updateSession();
        } catch (error) {
          console.error('세션 업데이트 실패:', error);
        }
      }
    };

    // 초기 세션 갱신
    refreshSessionData();

    // 주기적으로 세션 갱신
    const intervalId = setInterval(() => {
      refreshSessionData();
    }, 30000); // 30초마다 갱신

    return () => clearInterval(intervalId);
  }, []); // 컴포넌트 마운트 시에만 실행

  // 세션 업데이트 이벤트를 감지하는 리스너
  useEffect(() => {
    const handleStorageChange = async (event) => {
      // 로컬 스토리지의 세션 또는 토큰이 변경되면 세션 갱신
      if (event.key === 'next-auth.session-token' || event.key === 'next-auth.callback-url') {
        await updateSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateSession]);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // 스크롤 위치에 따라 네비게이션 스타일 변경
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 모바일 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 모바일 메뉴 닫기 함수
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // 수동으로 세션 갱신하는 함수
  const refreshUserSession = async () => {
    try {
      await fetch('/api/auth/session/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      await updateSession();
    } catch (error) {
      console.error('세션 갱신 실패:', error);
    }
  };

  // 미들웨어나 포커스, 클릭 이벤트 등에서 세션 갱신 유도
  useEffect(() => {
    const handleFocus = () => refreshUserSession();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2 bg-white/95 backdrop-blur-sm shadow-md' : 'py-4 bg-white/95'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 group">
          <div className="relative w-[110px] h-[45px] transition-all duration-300 group-hover:scale-110">
            <Image
              src="/textlogo1.webp"
              alt="Text Logo"
              fill
              style={{ objectFit: 'contain' }}
              sizes="110px"
              className="drop-shadow-sm"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5 font-['BMJUA']">
          {session ? (
            // 로그인된 사용자를 위한 메뉴
            <>
              <KingOnlySection fallback={<></>}>
                <Link
                  href="/manage"
                  className="relative text-gray-700 hover:text-[#87CEEB] transition-colors duration-300 font-medium overflow-hidden group"
                >
                  <span className="relative z-10">관리자 페이지</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87CEEB] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </KingOnlySection>
              <Link
                href="/userpage/application"
                className="relative text-gray-700 hover:text-[#87CEEB] transition-colors duration-300 font-medium overflow-hidden group"
              >
                <span className="relative z-10">서비스신청</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87CEEB] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href={`/userpage/${session.user.id}`}
                className="relative text-gray-700 hover:text-[#87CEEB] transition-colors duration-300 font-medium overflow-hidden group"
              >
                <span className="relative z-10">마이페이지</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87CEEB] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              {/* 사용자 환영 메시지 */}
              <div className="flex items-center gap-1">
                <div className="h-6 w-px bg-gray-300 -ml-1 mr-2"></div>
                <span className="text-sm text-gray-600 font-normal italic">
                  <span className="font-semibold text-[#5F9DF7]">
                    {userName || session.user.name}
                  </span>
                  <span className="text-xs">님</span>
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-600 hover:text-[#87CEEB] text-xs font-medium px-2 py-1 rounded-full border border-gray-300 hover:border-[#87CEEB] transition-all duration-300 hover:shadow-sm"
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            // 비로그인 사용자를 위한 메뉴
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-[#87CEEB] text-sm font-medium px-3 py-1 rounded-full border border-gray-300 hover:border-[#87CEEB] transition-all duration-300 hover:shadow-sm"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-[#87CEEB] to-[#5F9DF7] text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 font-medium -ml-4"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden relative z-50 w-10 h-10 flex items-center justify-center text-gray-700 rounded-full hover:bg-gray-100 transition-colors ${
            isMenuOpen ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Menu Dropdown */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleMenu}
        >
          <div
            className={`absolute top-0 right-0 h-screen w-64 bg-white shadow-xl transition-transform duration-300 p-6 flex flex-col gap-6 ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-4 font-['BMJUA']">
              {session ? (
                // 로그인된 사용자를 위한 모바일 메뉴
                <>
                  {/* 모바일 환영 메시지 */}
                  <div className="text-sm text-gray-600 font-normal italic mb-2 text-center">
                    <span className="font-semibold text-[#5F9DF7]">
                      {userName || session.user.name}
                    </span>
                    <span className="text-xs">님</span>
                    환영합니다!
                  </div>
                  <KingOnlySection fallback={<></>}>
                    <Link
                      href="/manage"
                      className="text-gray-700 hover:text-[#87CEEB] transition-colors duration-200 py-2 border-b border-gray-100"
                      onClick={closeMenu}
                    >
                      관리자 페이지
                    </Link>
                  </KingOnlySection>
                  <Link
                    href="/userpage/application"
                    className="text-gray-700 hover:text-[#87CEEB] transition-colors duration-200 py-2 border-b border-gray-100"
                    onClick={closeMenu}
                  >
                    서비스신청
                  </Link>
                  <Link
                    href={`/userpage/${session.user.id}`}
                    className="text-gray-700 hover:text-[#87CEEB] transition-colors duration-200 py-2 border-b border-gray-100"
                    onClick={closeMenu}
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => {
                      closeMenu();
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-gray-600 hover:text-[#87CEEB] text-sm font-medium w-full py-2 rounded-full border border-gray-300 hover:border-[#87CEEB] transition-all duration-300"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                // 비로그인 사용자를 위한 모바일 메뉴
                <>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-[#87CEEB] to-[#5F9DF7] text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 font-medium text-center"
                    onClick={closeMenu}
                  >
                    회원가입
                  </Link>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-[#87CEEB] text-sm font-medium w-full py-2 rounded-full border border-gray-300 hover:border-[#87CEEB] transition-all duration-300 text-center"
                    onClick={closeMenu}
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
