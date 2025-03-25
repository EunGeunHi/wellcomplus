'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function HeroSlider() {
  const [currentImage, setCurrentImage] = useState(0);
  const intervalRef = useRef(null);

  const images = [
    '/mainpageimg/1.jpg',
    '/mainpageimg/2.jpg',
    '/mainpageimg/3.jpg',
    '/mainpageimg/4.jpg',
    '/mainpageimg/5.jpg',
  ];

  const totalImages = images.length;

  // 슬라이드 전환 함수를 useCallback으로 메모이제이션
  const nextSlide = useCallback(() => {
    setCurrentImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  }, [totalImages]);

  const prevSlide = useCallback(() => {
    setCurrentImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  }, [totalImages]);

  // 자동 슬라이드 기능
  useEffect(() => {
    // 기존 인터벌 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 새 인터벌 설정
    intervalRef.current = setInterval(nextSlide, 6000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nextSlide, totalImages]);

  // 이미지 슬라이드 비율 계산
  const progressWidth = totalImages > 0 ? ((currentImage + 1) / totalImages) * 100 : 0;

  return (
    <>
      {/* Image column */}
      <div className="order-1 lg:order-2 relative">
        {totalImages > 0 && (
          <>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 to-transparent z-10"></div>

              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`컴퓨터 시스템 이미지 ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentImage ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={(e) => {
                    console.error(`이미지 로드 실패: ${image}`);
                    e.target.src = '/mainpageimg/fallback.jpg'; // 대체 이미지 설정
                  }}
                />
              ))}

              {/* 이미지가 2개 이상일 때만 네비게이션 버튼 표시 */}
              {totalImages > 1 && (
                <div className="absolute bottom-6 right-6 flex gap-3 z-20">
                  <button
                    onClick={prevSlide}
                    aria-label="이전 이미지"
                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="다음 이미지"
                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* 이미지가 2개 이상일 때만 슬라이드 카운터 표시 */}
              {totalImages > 1 && (
                <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm z-20">
                  {currentImage + 1} / {totalImages}
                </div>
              )}
            </div>

            {/* 이미지가 2개 이상일 때만 프로그레스 바 표시 */}
            {totalImages > 1 && (
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
            )}
          </>
        )}

        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-sky-200 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-60"></div>
      </div>
    </>
  );
}
