'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Computer } from 'lucide-react';

// 설정 파일을 import (빌드 시 정적으로 로드됨)
import assemblyConfig from '../../public/assembly/config.json';

export default function AssemblyShowcaseOptimized() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const videoRefDesktop = useRef(null);
  const videoRefMobile = useRef(null);

  const { images, videos, settings } = assemblyConfig;

  // 이미지 자동 순환
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, settings.imageRotationInterval);

    return () => clearInterval(interval);
  }, [images.length, settings.imageRotationInterval]);

  // 동영상 자동 순환 (단순화된 접근)
  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => {
      const nextIndex = (prev + 1) % videos.length;

      return nextIndex;
    });
  };

  // 동영상 인덱스 변경 시 새 동영상 로드 및 재생
  useEffect(() => {
    const updateVideo = (videoRef) => {
      const video = videoRef.current;
      if (!video || videos.length === 0) return;

      // 동영상 소스 변경
      const source = video.querySelector('source');
      if (source) {
        source.src = `/assembly/videos/${videos[currentVideoIndex].filename}`;
        video.load();

        // 로드 완료 후 재생
        const handleCanPlay = () => {
          video.play().catch((error) => {
            console.error('동영상 재생 실패:', error);
          });
          video.removeEventListener('canplay', handleCanPlay);
        };

        video.addEventListener('canplay', handleCanPlay);
      }
    };

    // 데스크톱과 모바일 동영상 모두 업데이트
    updateVideo(videoRefDesktop);
    updateVideo(videoRefMobile);
  }, [currentVideoIndex, videos.length]);

  // 컴포넌트 마운트 시 로딩 완료
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#3661EB] to-[#87CEEB] rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <p className="text-gray-600 font-medium">갤러리를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0 && videos.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-96 flex items-center justify-center">
            <div className="text-center">
              <Computer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">표시할 콘텐츠가 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">조립 완성품 사진과 영상을 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 font-['NanumGothic']">
        {/* 섹션 제목 */}
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-2xl sm:text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#3661EB] to-[#87CEEB]">
            웰컴시스템 조립PC
          </h2>

          <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            35년 노하우!! 화려한RGB!! 깔끔한 선정리!! 깔끔하고 멋진 디자인!!
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            현재 이미지는 아무거나 넣은 테스트 이미지, 영상입니다.
          </p>
        </div>

        {/* 갤러리 컨테이너 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* PC 레이아웃 */}
          <div className="hidden md:flex h-[650px] gap-0.5">
            {/* 왼쪽: 동영상 */}
            <div className="w-1/2 relative bg-black">
              {videos.length > 0 ? (
                <video
                  ref={videoRefDesktop}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={settings.muted}
                  loop={false}
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnded}
                  onError={(e) => console.error('데스크톱 동영상 오류:', e)}
                >
                  <source
                    src={`/assembly/videos/${videos[currentVideoIndex].filename}`}
                    type="video/mp4"
                  />
                  동영상을 지원하지 않는 브라우저입니다.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  동영상 없음
                </div>
              )}

              {/* 동영상 정보 오버레이 */}
              {videos.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6">
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-1">
                    {videos[currentVideoIndex].title}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                    {videos[currentVideoIndex].description}
                  </p>
                </div>
              )}
            </div>

            {/* 오른쪽: 이미지 그리드 (2x2) */}
            <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-0.5">
              {images.slice(0, 4).map((image, index) => {
                const displayIndex = (currentImageIndex + index) % images.length;
                const displayImage = images[displayIndex];

                return (
                  <div key={`${displayIndex}-${index}`} className="relative group overflow-hidden">
                    <Image
                      src={`/assembly/photos/${displayImage.filename}`}
                      alt={displayImage.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 768px) 25vw, 50vw"
                      priority={index < 2}
                    />

                    {/* 이미지 정보 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 group-hover:from-black/70 group-hover:via-black/20 group-hover:to-transparent transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#3661EB] rounded-full"></div>
                          <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                            {displayImage.category}
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-xs sm:text-sm leading-tight">
                          {displayImage.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 모바일 레이아웃 */}
          <div className="md:hidden flex flex-col gap-0.5">
            {/* 상단: 동영상 */}
            <div className="relative bg-black h-[200px] sm:h-[260px]">
              {videos.length > 0 ? (
                <video
                  ref={videoRefMobile}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={settings.muted}
                  loop={false}
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnded}
                  onError={(e) => console.error('모바일 동영상 오류:', e)}
                >
                  <source
                    src={`/assembly/videos/${videos[currentVideoIndex].filename}`}
                    type="video/mp4"
                  />
                  동영상을 지원하지 않는 브라우저입니다.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  동영상 없음
                </div>
              )}

              {/* 동영상 정보 오버레이 */}
              {videos.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4">
                  <h3 className="text-white font-bold text-sm sm:text-lg mb-1">
                    {videos[currentVideoIndex].title}
                  </h3>
                  <p className="text-white/90 text-xs leading-relaxed">
                    {videos[currentVideoIndex].description}
                  </p>
                </div>
              )}
            </div>

            {/* 하단: 이미지 그리드 (2x2) */}
            <div className="grid grid-cols-2 grid-rows-2 h-[200px] sm:h-[260px] gap-0.5">
              {images.slice(0, 4).map((image, index) => {
                const displayIndex = (currentImageIndex + index) % images.length;
                const displayImage = images[displayIndex];

                return (
                  <div
                    key={`mobile-${displayIndex}-${index}`}
                    className="relative group overflow-hidden"
                  >
                    <Image
                      src={`/assembly/photos/${displayImage.filename}`}
                      alt={displayImage.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-active:scale-105"
                      sizes="50vw"
                      priority={index < 2}
                    />

                    {/* 이미지 정보 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 group-active:from-black/70 group-active:via-black/20 group-active:to-transparent transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 transform translate-y-full group-active:translate-y-0 transition-transform duration-300 ease-out">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#3661EB] rounded-full"></div>
                          <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                            {displayImage.category}
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-xs leading-tight">
                          {displayImage.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
