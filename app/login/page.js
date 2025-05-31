'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SiNaver } from 'react-icons/si';

/**
 * 로그인 페이지 컴포넌트
 * Auth.js를 사용하여 사용자 인증을 처리
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 콜백 URL과 메시지 추출
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // URL 쿼리 파라미터 변경 시 메시지 상태 업데이트
  useEffect(() => {
    if (success) {
      setSuccessMessage(success);
    }
    if (error) {
      // 오류 코드에 따라 다른 메시지 표시
      setFormError(
        error === 'CredentialsSignin'
          ? '이메일 또는 비밀번호가 일치하지 않습니다.'
          : '로그인 중 오류가 발생했습니다.'
      );
    }
  }, [success, error]);

  /**
   * 입력 필드 변경 핸들러
   * @param {React.ChangeEvent} e - 입력 이벤트
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * 로그인 폼 제출 핸들러
   * @param {React.FormEvent} e - 폼 이벤트
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      const { email, password } = formData;

      // Auth.js의 signIn 함수를 사용하여 로그인 시도
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      // 로그인 실패 시 오류 메시지 표시
      if (result.error) {
        setFormError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else {
        // 로그인 성공 시 callbackUrl로 리다이렉트
        router.push(callbackUrl);
      }
    } catch (error) {
      setFormError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 구글 로그인 핸들러
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      setFormError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  /**
   * 카카오 로그인 핸들러
   */
  const handleKakaoSignIn = async () => {
    setLoading(true);
    try {
      await signIn('kakao', { callbackUrl });
    } catch (error) {
      setFormError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  /**
   * 네이버 로그인 핸들러
   */
  const handleNaverSignIn = async () => {
    setLoading(true);
    try {
      await signIn('naver', { callbackUrl });
    } catch (error) {
      setFormError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start sm:justify-center items-center py-8 sm:py-20 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
          로그인
        </h2>

        {/* 오류 메시지 표시 */}
        {formError && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-100 text-red-600 rounded-lg text-sm">
            {formError}
          </div>
        )}

        {/* 성공 메시지 표시 */}
        {successMessage && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-100 text-green-600 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* 이메일 입력 필드 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="이메일을 입력하세요"
            />
          </div>

          {/* 비밀번호 입력 필드 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#87CEEB] to-[#5F9DF7] text-white py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 소셜 로그인 구분선 */}
        <div className="mt-3 sm:mt-4 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        {/* 구글 로그인 버튼 */}
        <div className="mt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5F9DF7] transition-all duration-300 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <FcGoogle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Google로 계속하기
            </span>
          </button>
        </div>

        {/* 카카오 로그인 버튼 */}
        <div className="mt-2">
          <button
            type="button"
            onClick={handleKakaoSignIn}
            disabled={loading}
            className={`w-full flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEE500] transition-all duration-300 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RiKakaoTalkFill className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#391B1B]" />
            <span className="text-[#391B1B] font-medium text-sm sm:text-base">
              카카오로 계속하기
            </span>
          </button>
        </div>

        {/* 회원가입 페이지 링크 */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-[#5F9DF7] hover:underline font-medium">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>

      {/* 로딩 모달 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">로그인 중입니다</h3>
              <p className="text-sm text-gray-600">잠시만 기다려주세요...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 메인 Login 페이지 컴포넌트
export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
