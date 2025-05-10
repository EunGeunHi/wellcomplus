'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RecordManagePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage/record/search');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>레코드 관리 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
