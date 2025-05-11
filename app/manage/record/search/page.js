'use client';

import { Suspense } from 'react';
import RecordSearchContent from './RecordSearchContent';

export default function RecordSearchPage() {
  return (
    <Suspense fallback={<div className="text-center p-6">로딩 중...</div>}>
      <RecordSearchContent />
    </Suspense>
  );
}
