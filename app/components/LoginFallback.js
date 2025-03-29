import Link from 'next/link';

export default function LoginFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 font-[NanumGothic]">
      <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-blue-100/50 max-w-md w-full">
        <h2 className="text-2xl font-[BMJUA] text-gray-900 mb-4">로그인 후 사용해주세요!</h2>
        <p className="text-gray-600 mb-8">서비스를 이용하기 위해서는 로그인이 필요합니다.</p>
        <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
          <Link
            href="/login"
            className="w-full inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-200"
          >
            로그인하기
          </Link>
          <Link
            href="/"
            className="w-full inline-block bg-white hover:bg-gray-50 text-blue-500 border-2 border-blue-500 font-semibold py-2 px-5 rounded-lg transition-colors duration-200"
          >
            매인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
