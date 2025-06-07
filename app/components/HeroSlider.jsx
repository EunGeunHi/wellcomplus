'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function HeroSlider() {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef(null);

  const images = [
    '/mainpageimg/1.webp',
    '/mainpageimg/2.webp',
    '/mainpageimg/3.webp',
    '/mainpageimg/4.webp',
    '/mainpageimg/5.webp',
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
    // 첫 번째 이미지 로드 후에만 자동 슬라이드 시작
    if (!isLoaded) return;

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
  }, [nextSlide, totalImages, isLoaded]);

  // 이미지 슬라이드 비율 계산
  const progressWidth = totalImages > 0 ? ((currentImage + 1) / totalImages) * 100 : 0;

  return (
    <>
      {/* Image column */}
      <div className="order-2 lg:order-2 relative">
        {totalImages > 0 && (
          <>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 to-transparent z-10"></div>

              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImage ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {!imageLoadErrors.has(image) ? (
                    <Image
                      src={image}
                      alt={`컴퓨터 시스템 이미지 ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                      // 첫 번째 이미지만 priority, 나머지는 lazy loading
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      // 이미지 preload를 위한 placeholder 설정
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAAAAAAAAAAAAAAAAAAAACv/EAB8QAAEEAwEBAQEAAAAAAAAAAAABAgMEBQYHCBESE//EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6b+h0R+SlPoABYxSM0GYAW7qNR7LWNR8YGNsaLvE4sFllYPWvEZGWvqXZjUyNOYO4VJlKhKB1WGKJK4IjDFxwqFGgMAB7jTcCRpGMFQQKZGOsrCgBTrWVu3G+nqUFdJyKNdI="
                      onLoad={() => {
                        if (index === 0 && !isLoaded) {
                          setIsLoaded(true);
                        }
                      }}
                      onError={() => {
                        console.error(`이미지 로드 실패: ${image}`);
                        setImageLoadErrors((prev) => new Set([...prev, image]));
                      }}
                    />
                  ) : (
                    // 이미지 로드 실패 시 플레이스홀더
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg
                          className="w-16 h-16 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm">이미지를 불러올 수 없습니다</p>
                      </div>
                    </div>
                  )}
                </div>
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
