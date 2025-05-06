import { Suspense } from 'react';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';

// 검색 폼과 결과를 표시하는 클라이언트 컴포넌트
import EstimateSearchContent from './EstimateSearchContent';

// 페이지가 항상 최신 상태로 유지되도록 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function EstimateSearchPage() {
  return (
    <KingOnlySection fallback={<KingFallback />}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Suspense fallback={<div className="text-center py-10">로딩 중...</div>}>
          <EstimateSearchContent />
        </Suspense>
      </div>
    </KingOnlySection>
  );
}
