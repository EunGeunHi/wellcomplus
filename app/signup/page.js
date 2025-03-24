import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Mail, User, Phone, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 왼쪽 이미지 섹션 - 데스크탑에서만 표시 */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#87CEEB] to-[#3661EB] relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 z-10">
          <div className="max-w-md">
            <div className="mb-8 flex justify-center">
              <div className="relative w-[200px] h-[80px]">
                <div className="absolute -inset-6 rounded-full bg-gradient-radial from-white via-white/50 to-transparent blur-[20px] opacity-100"></div>
                <Image
                  src="/textlogo2.png"
                  alt="웰컴플러스 로고"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="200px"
                  className="drop-shadow-md"
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6 font-['BMJUA']">
              웰컴플러스와 함께하는 미래를 시작하세요
            </h1>
            <p className="text-lg mb-8 font-['NanumGothic']">
              회원가입 후 맞춤형 상담, 특별 혜택, 무상 AS까지 더 많은 서비스를 이용해보세요.
            </p>
            <div className="w-16 h-1 bg-white rounded-full mb-8"></div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-white">맞춤형 PC 추천 및 가격 비교</p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-white">회원 전용 특별 할인 및 프로모션</p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-white">주문 내역 관리 및 배송 추적</p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-white">평생 무상 AS 관리</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 회원가입 폼 섹션 */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-[#3661EB] transition-all flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              <span>홈으로</span>
            </Link>
            <Link
              href="/"
              className="relative w-[100px] h-[40px] transition-all duration-300 hover:scale-110"
            >
              <Image
                src="/textlogo2.png"
                alt="웰컴플러스 로고"
                fill
                style={{ objectFit: 'contain' }}
                sizes="100px"
                className="drop-shadow-sm"
                priority
              />
            </Link>
          </div>

          <h2 className="text-3xl font-bold mb-2 text-gray-800 font-['BMJUA']">회원가입</h2>
          <p className="text-gray-600 mb-8 font-['NanumGothic']">
            몇 가지 정보만 입력하시면 바로 시작할 수 있습니다.
          </p>

          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#3661EB] focus:border-[#3661EB] shadow-sm"
                  placeholder="홍길동"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#3661EB] focus:border-[#3661EB] shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#3661EB] focus:border-[#3661EB] shadow-sm"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#3661EB] focus:border-[#3661EB] shadow-sm"
                  placeholder="8자 이상 입력해주세요"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                8자 이상, 영문/숫자/특수문자 조합을 권장합니다
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#3661EB] focus:border-[#3661EB] shadow-sm"
                  placeholder="비밀번호를 다시 입력해주세요"
                />
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="focus:ring-[#3661EB] h-4 w-4 text-[#3661EB] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  <span>이용약관 및 </span>
                  <a href="#" className="text-[#3661EB] hover:underline">
                    개인정보 처리방침
                  </a>
                  <span>에 동의합니다</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3661EB] to-[#87CEEB] text-white py-3 rounded-lg text-sm font-semibold hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5"
            >
              가입하기
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">빠른 회원가입</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 가입
              </button>
              <button className="flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 208 191" fill="#FEE500">
                  <path d="M104 0C46.56 0 0 36.71 0 82c0 29.28 19.47 55 48.75 69.48-1.59 5.49-10.24 35.34-10.58 37.69 0 0-.21 1.76.93 2.43.79.46 1.79.27 1.79.27.82-.06 12.9-1.73 64.3-34.33 20.7 4.98 42.1 2.52 61.3-3.95C184.21 143.98 208 118.3 208 82 208 36.71 161.44 0 104 0ZM48.19 105.67c-9.55 0-17.22-7.7-17.22-17.23 0-9.55 7.67-17.22 17.22-17.22 9.52 0 17.22 7.67 17.22 17.22 0 9.54-7.7 17.23-17.22 17.23Zm55.8 0c-9.55 0-17.22-7.7-17.22-17.23 0-9.55 7.67-17.22 17.22-17.22 9.52 0 17.22 7.67 17.22 17.22 0 9.54-7.7 17.23-17.22 17.23Zm55.8 0c-9.55 0-17.22-7.7-17.22-17.23 0-9.55 7.67-17.22 17.22-17.22 9.55 0 17.22 7.67 17.22 17.22 0 9.54-7.67 17.23-17.22 17.23Z" />
                </svg>
                카카오로 가입
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium text-[#3661EB] hover:text-[#87CEEB]">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
