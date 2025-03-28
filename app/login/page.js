'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">로그인</h2>

        {/* 오류 메시지 표시 */}
        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{formError}</div>
        )}

        {/* 성공 메시지 표시 */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* 로그인 옵션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                로그인 상태 유지
              </label>
            </div>
            <div className="text-sm">
              <Link href="#" className="text-[#5F9DF7] hover:underline font-medium">
                비밀번호 찾기
              </Link>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#87CEEB] to-[#5F9DF7] text-white py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 font-medium ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 회원가입 페이지 링크 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-[#5F9DF7] hover:underline font-medium">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>
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
