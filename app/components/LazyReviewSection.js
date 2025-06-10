'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// ReviewCarousel을 진짜 Lazy Loading으로 설정
const ReviewCarousel = dynamic(() => import('./ReviewCarousel'), {
  loading: () => (
    <div className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-md w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-96 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

// 실제 스크롤 기반 지연 로딩을 위한 컴포넌트
export default function LazyReviewSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect(); // 한 번 로드되면 observer 해제
        }
      },
      {
        // 섹션이 뷰포트에 10% 보일 때 로드 시작
        threshold: 0.1,
        // 뷰포트 하단 200px 전에 미리 로드 (사용자 경험 개선)
        rootMargin: '200px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasLoaded]);

  return (
    <div ref={sectionRef}>
      {isVisible ? (
        <ReviewCarousel />
      ) : (
        // 플레이스홀더 - 실제 높이를 유지해서 레이아웃 시프트 방지
        <div className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center">
              <div className="h-8 bg-transparent rounded-md w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-transparent rounded-md w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-transparent rounded-lg h-48"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
