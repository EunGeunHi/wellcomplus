'use client';

import { Suspense } from 'react';
import AddEditRecordContent from './AddEditRecordContent';

export default function AddEditRecordPage() {
  return (
    <Suspense fallback={<div className="text-center p-6">로딩 중...</div>}>
      <AddEditRecordContent />
    </Suspense>
  );
}
