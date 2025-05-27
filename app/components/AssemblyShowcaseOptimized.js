'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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
      <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">갤러리를 불러오는 중...</div>
      </div>
    );
  }

  if (images.length === 0 && videos.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">표시할 콘텐츠가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* PC 레이아웃 */}
      <div className="hidden md:flex h-96">
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-semibold text-lg">
                {videos[currentVideoIndex].title}
              </h3>
              <p className="text-white/80 text-sm">{videos[currentVideoIndex].description}</p>
            </div>
          )}
        </div>

        {/* 오른쪽: 이미지 그리드 (2x2) */}
        <div className="w-1/2 grid grid-cols-2 grid-rows-2">
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-white font-medium text-sm">{displayImage.title}</h4>
                    <span className="text-white/80 text-xs capitalize">
                      {displayImage.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="md:hidden">
        {/* 상단: 동영상 */}
        <div className="relative bg-black h-48">
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <h3 className="text-white font-semibold">{videos[currentVideoIndex].title}</h3>
              <p className="text-white/80 text-sm">{videos[currentVideoIndex].description}</p>
            </div>
          )}
        </div>

        {/* 하단: 이미지 그리드 (2x2) */}
        <div className="grid grid-cols-2 grid-rows-2 h-48">
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
                <div className="absolute inset-0 bg-black/0 group-active:bg-black/50 transition-colors duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-active:translate-y-0 transition-transform duration-300">
                    <h4 className="text-white font-medium text-xs">{displayImage.title}</h4>
                    <span className="text-white/80 text-xs capitalize">
                      {displayImage.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
