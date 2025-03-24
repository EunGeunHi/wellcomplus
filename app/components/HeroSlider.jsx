'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';

export default function HeroSlider() {
  const [currentImage, setCurrentImage] = useState(0);
  const intervalRef = useRef(null);

  const images = [
    '/mainpageimg/test1.jpg',
    '/mainpageimg/test2.jpg',
    '/mainpageimg/test3.jpg',
    '/mainpageimg/test4.jpg',
    '/mainpageimg/test5.jpg',
    '/mainpageimg/test6.jpg',
    '/mainpageimg/test7.jpg',
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
    <div className="w-full bg-gradient-to-r from-blue-50 to-sky-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content column */}
          <div className="order-2 lg:order-1">
            <span className="inline-block px-4 py-1 text-sky-700 bg-sky-100 rounded-full text-sm font-medium font-['ShillaCulture'] mb-6">
              35년 전통의 기술력
            </span>

            <h1 className="text-slate-800 mb-6">
              <span className="block text-5xl md:text-7xl font-['BMJUA'] font-medium leading-tight mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                  웰컴
                </span>
                시스템에서
                <br />
                <span className="relative">맞춤형</span>
                <span> 솔루션</span>을 경험하세요
              </span>
              <span className="block text-xl md:text-2xl text-slate-600 font-['ShillaCulture'] font-normal mt-6">
                35년간 쌓아온 기술 노하우로 고객님의 IT 환경을 한 단계 업그레이드해 드립니다
              </span>
            </h1>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                className="group bg-gradient-to-r from-blue-600 to-sky-500 px-8 py-4 rounded-lg text-white 
                font-['ShillaCulture'] font-medium text-lg hover:shadow-lg hover:shadow-sky-200 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  바로 주문하기
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                className="px-8 py-4 rounded-lg text-slate-700 border border-slate-300
                font-['ShillaCulture'] font-medium text-lg hover:border-sky-500 hover:text-sky-600 transition-all duration-300"
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span className="flex items-center justify-center gap-2">더 알아보기</span>
              </button>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
}
