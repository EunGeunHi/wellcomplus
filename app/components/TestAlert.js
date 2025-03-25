'use client';

import { useState, useEffect } from 'react';

export default function TestAlert() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // localStorage에서 마지막으로 알림창을 표시한 날짜 가져오기
    const lastShownDate = localStorage.getItem('lastShownTestAlert');
    const today = new Date().toDateString();

    // 오늘 알림창을 보여준 적이 없다면 표시하기
    if (!lastShownDate || lastShownDate !== today) {
      setIsVisible(true);
      localStorage.setItem('lastShownTestAlert', today);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-lg px-6 py-4 max-w-md">
        <div className="flex items-center gap-3">
          <span className="text-blue-600 text-sm">ℹ️</span>
          <p className="text-gray-600 text-sm">
            해당 웹서비스는 제작중이며 테스트 배포중입니다. <br />
            기능이 아직 모두 완성되지 않았습니다.
            <br />
            최대한 빨리 완성하도록 노력하겠습니다.
            <br />
            감사합니다.
          </p>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
