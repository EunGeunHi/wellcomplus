'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SiNaver } from 'react-icons/si';
import { formatKoreanPhoneNumber, isValidPhoneNumber } from '@/utils/phoneFormatter';

/**
 * 회원가입 페이지 컴포넌트
 * 사용자 정보를 입력받아 회원가입 API를 호출
 */
export default function SignupPage() {
  const router = useRouter(); // Next.js 라우터

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(''); // 오류 메시지 상태
  const [loading, setLoading] = useState(false); // 로딩 상태

  /**
   * 입력 필드 변경 핸들러
   * @param {React.ChangeEvent} e - 입력 이벤트
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 전화번호인 경우 포맷팅 적용
    if (name === 'phoneNumber') {
      const formattedValue = formatKoreanPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * 폼 제출 핸들러
   * @param {React.FormEvent} e - 폼 이벤트
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 이름 유효성 검사
    if (!formData.name || formData.name.trim().length < 2) {
      setError('이름은 2자 이상 입력해주세요.');
      return;
    }

    // 비밀번호 일치 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 전화번호 유효성 검사
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setError('유효한 전화번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true); // 로딩 상태 활성화

      // 회원가입 API 호출
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const data = await response.json();

      // 요청 실패 시 에러 처리
      if (!response.ok) {
        throw new Error(data.message || '회원가입 중 오류가 발생했습니다.');
      }

      // 회원가입 성공 후 로그인 페이지로 이동 (성공 메시지 포함)
      router.push('/login?success=계정이 생성되었습니다. 로그인해주세요.');
    } catch (error) {
      setError(error.message); // 오류 메시지 설정
    } finally {
      setLoading(false); // 로딩 상태 비활성화
    }
  };

  /**
   * 구글 회원가입 핸들러
   */
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      // 구글 로그인(회원가입)으로 리다이렉트
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      setError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  /**
   * 카카오 회원가입 핸들러
   */
  const handleKakaoSignUp = async () => {
    setLoading(true);
    try {
      // 카카오 로그인(회원가입)으로 리다이렉트
      await signIn('kakao', { callbackUrl: '/' });
    } catch (error) {
      setError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  /**
   * 네이버 회원가입 핸들러
   */
  const handleNaverSignUp = async () => {
    setLoading(true);
    try {
      // 네이버 로그인(회원가입)으로 리다이렉트
      await signIn('naver', { callbackUrl: '/' });
    } catch (error) {
      setError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start sm:justify-center items-center py-8 sm:py-20 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
          회원가입
        </h2>

        {/* 오류 메시지 표시 */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* 이름 입력 필드 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름(닉네임)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 이메일 입력 필드 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일(ID)
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

          {/* 전화번호 입력 필드 */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="숫자만 입력하세요"
              maxLength={13} // 하이픈 포함 최대 길이
            />
            <p className="mt-1 text-xs text-gray-500">
              숫자만 입력하면 자동으로 하이픈(-)이 추가됩니다.
            </p>
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

          {/* 비밀번호 확인 입력 필드 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#87CEEB] to-[#5F9DF7] text-white py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '처리 중...' : '가입하기'}
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

        {/* 구글 회원가입 버튼 */}
        <div className="mt-2">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className={`w-full flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5F9DF7] transition-all duration-300 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <FcGoogle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Google로 가입하기
            </span>
          </button>
        </div>

        {/* 카카오 회원가입 버튼 */}
        <div className="mt-2">
          <button
            type="button"
            onClick={handleKakaoSignUp}
            disabled={loading}
            className={`w-full flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEE500] transition-all duration-300 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RiKakaoTalkFill className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#391B1B]" />
            <span className="text-[#391B1B] font-medium text-sm sm:text-base">
              카카오로 가입하기
            </span>
          </button>
        </div>

        {/* 네이버 회원가입 버튼 */}
        <div className="mt-2">
          <button
            type="button"
            onClick={handleNaverSignUp}
            disabled={loading}
            className={`w-full flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 bg-[#03C75A] rounded-lg hover:bg-[#02B350] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#03C75A] transition-all duration-300 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <SiNaver className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white" />
            <span className="text-white font-medium text-sm sm:text-base">네이버로 가입하기</span>
          </button>
        </div>

        {/* 로그인 페이지 링크 */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-[#5F9DF7] hover:underline font-medium">
              로그인하기
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">회원가입 중입니다</h3>
              <p className="text-sm text-gray-600">잠시만 기다려주세요...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
