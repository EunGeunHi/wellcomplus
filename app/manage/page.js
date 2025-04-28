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
            <h2 className="text-xl font-semibold mb-2">견적 검색</h2>
            <p className="text-gray-600">등록된 견적 정보를 검색하고 관리합니다.</p>
          </Link>

          {/* 추가 관리 메뉴 */}
        </div>
      </KingOnlySection>
    </div>
  );
}
