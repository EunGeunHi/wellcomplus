import KingFallback from '../components/kingFallback';
import { KingOnlySection } from '../components/ProtectedContent';
import Link from 'next/link';

export default function ManagePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <KingOnlySection fallback={<KingFallback />}>
        <h1 className="text-3xl font-bold mb-8">관리자 페이지</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/manage/estimates/search"
            className="bg-white hover:bg-blue-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">견적 생성/검색</h2>
            <p className="text-gray-600">등록된 견적 정보를 생성/검색하고 관리합니다.</p>
          </Link>

          <Link
            href="/manage/record/search"
            className="bg-white hover:bg-blue-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">자료/기록 데이터</h2>
            <p className="text-gray-600">자료와 기록 데이터를 관리하고 조회합니다.</p>
          </Link>

          <Link
            href="/manage/delete"
            className="bg-white hover:bg-red-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2 text-red-600">비계약자 일괄삭제</h2>
            <p className="text-gray-600">견적데이터 중 비계약자 데이터를 일괄 삭제합니다.</p>
          </Link>

          <a
            href="https://cafe.naver.com/okwellcom"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-green-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-colors flex flex-col items-start"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-600">네이버 카페 이동</h2>
            <p className="text-gray-600">새 창에서 OK웰컴 네이버 카페를 엽니다.</p>
          </a>

          <a
            href="/chrome-expansion-program.zip"
            download
            className="bg-white hover:bg-blue-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-colors flex flex-col items-start"
          >
            <h2 className="text-xl font-semibold mb-2">크롬 확장 프로그램 다운로드</h2>
            <p className="text-gray-600">크롬 확장 프로그램 파일을 다운로드합니다.</p>
          </a>

          {/* 추가 관리 메뉴 */}
        </div>
      </KingOnlySection>
    </div>
  );
}
