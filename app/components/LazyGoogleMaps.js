'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export default function LazyGoogleMaps() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !mapLoaded) {
          setIsLoading(true);
          // 약간의 지연을 주어 매끄러운 전환 효과
          setTimeout(() => {
            setMapLoaded(true);
            setIsLoading(false);
          }, 500);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, // 10% 보일 때 로드
        rootMargin: '200px', // 200px 전에 미리 로드 (스마트 프리로딩)
      }
    );

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [mapLoaded]);

  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=부산컴퓨터도매상가&center=35.21399045790162,129.0796384915669&zoom=16`;

  return (
    <div
      ref={mapContainerRef}
      className="flex-grow h-[250px] sm:h-[320px] rounded-xl overflow-hidden"
    >
      {!mapLoaded ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center rounded-xl border-2 border-dashed border-blue-200">
          <div className="text-center">
            {isLoading ? (
              <>
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-3 animate-spin" />
                <p className="text-blue-600 font-medium text-sm sm:text-base">
                  지도를 불러오는 중...
                </p>
              </>
            ) : (
              <>
                <div className="relative mb-3">
                  <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-blue-600 font-medium text-sm sm:text-base mb-1">
                  웰컴시스템 위치
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">스크롤하면 지도가 로드됩니다</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="웰컴시스템 위치 안내 - 부산컴퓨터도매상가 2층 209호"
          className="transition-opacity duration-500 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
        />
      )}

      {/* SEO를 위한 숨겨진 주소 정보 */}
      <div className="sr-only">
        <h4>웰컴시스템 위치 정보</h4>
        <address>
          부산시 동래구 온천장로 20 (부산컴퓨터도매상가 2층 209호)
          <br />
          전화: 010-8781-8871, 051-926-6604
          <br />
          운영시간: 월~금 10:00-19:00, 토/공휴일 10:00-17:00, 일요일 휴무
        </address>
      </div>
    </div>
  );
}
