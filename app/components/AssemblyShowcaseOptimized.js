'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Computer } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePreloader } from '../hooks/usePreloader';

// 설정 파일을 import (빌드 시 정적으로 로드됨)
import assemblyConfig from '../../public/assembly/config.json';

export default function AssemblyShowcaseOptimized() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [settings, setSettings] = useState({ muted: true, autoplay: true });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRefDesktop = useRef(null);
  const videoRefMobile = useRef(null);
  const intervalRef = useRef(null);

  // 화면 크기 감지 (768px 이상 = 데스크탑)
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // 개선된 프리로딩 훅
  const {
    smartPreload,
    predictivePreload,
    cleanupOldCache,
    getPreloadedVideo,
    isImagePreloaded,
    isVideoPreloaded,
    isResourceLoading,
    isPreloading,
  } = usePreloader();

  const { images: configImages, videos: configVideos, settings: configSettings } = assemblyConfig;

  // 적극적 초기 프리로딩 실행
  useEffect(() => {
    setImages(configImages);
    setVideos(configVideos);
    setSettings(configSettings);

    // 컴포넌트 마운트 시 더 많은 리소스 프리로딩
    if (configImages.length > 0) {
      smartPreload(0, configImages, 'image', 5); // 처음 6개 이미지 프리로딩
      // 백그라운드에서 모든 이미지 예측 프리로딩
      setTimeout(() => {
        predictivePreload(0, configImages, 'image');
      }, 500);
    }

    if (configVideos.length > 0) {
      smartPreload(0, configVideos, 'video', 2); // 처음 3개 비디오 프리로딩
      // 백그라운드에서 다음 비디오들 예측 프리로딩
      setTimeout(() => {
        predictivePreload(0, configVideos, 'video');
      }, 1000);
    }
  }, [configImages, configVideos, configSettings, smartPreload, predictivePreload]);

  // 사전 예측 프리로딩 (이미지 변경 전에 미리 준비)
  const preloadNextResources = useCallback(
    (currentImgIndex, currentVidIndex) => {
      // 다음 이미지들 프리로딩 (현재 + 다음 3개)
      smartPreload(currentImgIndex, images, 'image', 3);

      // 다음 비디오 프리로딩 (현재 + 다음 1개)
      smartPreload(currentVidIndex, videos, 'video', 1);

      // 백그라운드 예측 프리로딩
      predictivePreload(currentImgIndex, images, 'image');
    },
    [images, videos, smartPreload, predictivePreload]
  );

  // 개선된 이미지 자동 순환
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      setCurrentImageIndex((prev) => {
        const nextIndex = (prev + 1) % images.length;

        // 이미지 변경 전에 다음 리소스들 미리 프리로딩
        preloadNextResources(nextIndex, currentVideoIndex);

        // 전환 애니메이션 완료 후 상태 초기화
        setTimeout(() => setIsTransitioning(false), 100);

        return nextIndex;
      });
    }, settings.imageRotationInterval);

    intervalRef.current = interval;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length, settings.imageRotationInterval, preloadNextResources, currentVideoIndex]);

  // 향상된 동영상 처리 함수
  const playVideoSmoothly = useCallback(
    async (videoElement, videoSrc) => {
      if (!videoElement) return;

      try {
        // 프리로딩된 비디오가 있는지 확인
        const preloadedVideo = getPreloadedVideo(videoSrc);

        if (preloadedVideo) {
          // 프리로딩된 비디오 사용 (끊김 없는 전환)
          const source = videoElement.querySelector('source');
          if (source && source.src !== videoSrc) {
            source.src = videoSrc;
            videoElement.load();
          }

          // 즉시 재생 시도
          await videoElement.play();
        } else {
          // 프리로딩되지 않은 경우 기존 방식
          const source = videoElement.querySelector('source');
          if (source) {
            source.src = videoSrc;
            videoElement.load();

            // canplay 이벤트 대기 후 재생
            await new Promise((resolve, reject) => {
              const handleCanPlay = () => {
                videoElement.removeEventListener('canplay', handleCanPlay);
                resolve();
              };

              const handleError = () => {
                videoElement.removeEventListener('error', handleError);
                reject(new Error('Video load failed'));
              };

              videoElement.addEventListener('canplay', handleCanPlay);
              videoElement.addEventListener('error', handleError);

              // 5초 타임아웃
              setTimeout(() => {
                videoElement.removeEventListener('canplay', handleCanPlay);
                videoElement.removeEventListener('error', handleError);
                reject(new Error('Video load timeout'));
              }, 5000);
            });

            await videoElement.play();
          }
        }
      } catch (error) {
        console.error('비디오 재생 실패:', error);
      }
    },
    [getPreloadedVideo]
  );

  // 개선된 동영상 자동 순환
  const handleVideoEnded = useCallback(() => {
    setCurrentVideoIndex((prev) => {
      const nextIndex = (prev + 1) % videos.length;

      // 비디오 변경 전에 다음 리소스들 미리 프리로딩
      preloadNextResources(currentImageIndex, nextIndex);

      return nextIndex;
    });
  }, [videos.length, preloadNextResources, currentImageIndex]);

  // 동영상 인덱스 변경 시 스무스한 로드 및 재생
  useEffect(() => {
    if (videos.length === 0) return;

    const videoSrc = `/assembly/videos/${videos[currentVideoIndex].filename}`;

    const updateVideo = async (videoRef) => {
      const video = videoRef.current;
      if (!video) return;

      try {
        await playVideoSmoothly(video, videoSrc);

        // 재생 완료 후 다음 비디오 프리로딩
        smartPreload(currentVideoIndex, videos, 'video', 2);
      } catch (error) {
        console.error('비디오 업데이트 실패:', error);
      }
    };

    // 현재 활성화된 비디오 ref만 업데이트
    if (isDesktop) {
      updateVideo(videoRefDesktop);
    } else {
      updateVideo(videoRefMobile);
    }
  }, [currentVideoIndex, videos, isDesktop, playVideoSmoothly, smartPreload]);

  // 화면 크기 변경 시 비디오 동기화 (개선된 버전)
  useEffect(() => {
    if (videos.length === 0) return;

    const videoSrc = `/assembly/videos/${videos[currentVideoIndex].filename}`;

    const updateVideo = async (videoRef) => {
      const video = videoRef.current;
      if (!video) return;

      try {
        await playVideoSmoothly(video, videoSrc);
      } catch (error) {
        console.error('화면 전환 후 비디오 동기화 실패:', error);
      }
    };

    if (isDesktop) {
      updateVideo(videoRefDesktop);
    } else {
      updateVideo(videoRefMobile);
    }
  }, [isDesktop, currentVideoIndex, videos, playVideoSmoothly]);

  // 주기적 메모리 정리 (성능 최적화)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupOldCache(15); // 더 관대한 캐시 정책
    }, 60000); // 1분마다 정리

    return () => clearInterval(cleanupInterval);
  }, [cleanupOldCache]);

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

          {/* 개발 모드에서만 상태 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-1 space-x-2">
              {isPreloading && <span>🔄 프리로딩 중...</span>}
              {isTransitioning && <span>✨ 전환 중...</span>}
            </div>
          )}
        </div>

        {/* 갤러리 컨테이너 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* 조건부 렌더링: 데스크탑 또는 모바일 중 하나만 렌더링 */}
          {isDesktop ? (
            /* PC 레이아웃 */
            <div className="flex h-[650px] gap-0.5">
              {/* 왼쪽: 동영상 */}
              <div className="w-1/2 relative bg-black">
                {videos.length > 0 ? (
                  <div className="absolute inset-0">
                    <video
                      key="desktop-video-player"
                      ref={videoRefDesktop}
                      className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                      autoPlay
                      muted={settings.muted}
                      loop={false}
                      playsInline
                      preload="auto"
                      onEnded={handleVideoEnded}
                      onError={(e) => console.error('데스크톱 동영상 오류:', e)}
                      onLoadStart={() => {
                        // 로드 시작 시 다음 비디오 프리로딩
                        const nextIndex = (currentVideoIndex + 1) % videos.length;
                        smartPreload(nextIndex, videos, 'video', 1);
                      }}
                    >
                      <source
                        src={`/assembly/videos/${videos[currentVideoIndex].filename}`}
                        type="video/mp4"
                      />
                      동영상을 지원하지 않는 브라우저입니다.
                    </video>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    동영상 없음
                  </div>
                )}

                {/* 동영상 정보 오버레이 */}
                {videos.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 z-10 transition-opacity duration-300">
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
                {[0, 1, 2, 3].map((gridIndex) => {
                  const displayIndex = (currentImageIndex + gridIndex) % images.length;
                  const displayImage = images[displayIndex];
                  const imageSrc = `/assembly/photos/${displayImage.filename}`;
                  const isPreloaded = isImagePreloaded(imageSrc);
                  const isLoading = isResourceLoading(imageSrc);

                  return (
                    <div
                      key={`desktop-grid-${gridIndex}`}
                      className="relative group overflow-hidden bg-gray-100"
                    >
                      {/* 로딩 상태 표시 */}
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse z-5 flex items-center justify-center">
                          <div className="text-gray-400 text-xs">로딩 중...</div>
                        </div>
                      )}

                      {/* 이미지 */}
                      <div
                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                          isTransitioning ? 'opacity-95' : 'opacity-100'
                        }`}
                      >
                        <Image
                          src={imageSrc}
                          alt={displayImage.alt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="25vw"
                          priority={gridIndex < 2}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAAAAAAAAAAAAAAAAAAAACv/EAB8QAAEEAwEBAQEAAAAAAAAAAAABAgMEBQYHCBESE//EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+SlPoABYxSM0GYAW7qNR7LWNR8YGNsaLvE4sFllYPWvEZGWvqXZjUyNOYO4VJlKhKB1WGKJK4IjDFxwqFGgMAB7jTcCRpGMFQQKZGOsrCgBTrWVu3G+nqUFdJyKNdI="
                          onLoad={() => {
                            // 이미지 로드 완료 시 다음 이미지들 프리로딩
                            if (gridIndex === 0) {
                              const nextIndex = (currentImageIndex + 4) % images.length;
                              smartPreload(nextIndex, images, 'image', 2);
                            }
                          }}
                        />
                      </div>

                      {/* 프리로딩 상태 표시 (개발 모드) */}
                      {process.env.NODE_ENV === 'development' && isPreloaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded z-10">
                          ✓
                        </div>
                      )}

                      {/* 이미지 정보 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 group-hover:from-black/70 group-hover:via-black/20 group-hover:to-transparent transition-all duration-500 z-10">
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
          ) : (
            /* 모바일 레이아웃 */
            <div className="flex flex-col gap-0.5">
              {/* 상단: 동영상 */}
              <div className="relative bg-black h-[200px] sm:h-[260px]">
                {videos.length > 0 ? (
                  <div className="absolute inset-0">
                    <video
                      key="mobile-video-player"
                      ref={videoRefMobile}
                      className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                      autoPlay
                      muted={settings.muted}
                      loop={false}
                      playsInline
                      preload="auto"
                      onEnded={handleVideoEnded}
                      onError={(e) => console.error('모바일 동영상 오류:', e)}
                      onLoadStart={() => {
                        // 로드 시작 시 다음 비디오 프리로딩
                        const nextIndex = (currentVideoIndex + 1) % videos.length;
                        smartPreload(nextIndex, videos, 'video', 1);
                      }}
                    >
                      <source
                        src={`/assembly/videos/${videos[currentVideoIndex].filename}`}
                        type="video/mp4"
                      />
                      동영상을 지원하지 않는 브라우저입니다.
                    </video>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    동영상 없음
                  </div>
                )}

                {/* 동영상 정보 오버레이 */}
                {videos.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 z-10 transition-opacity duration-300">
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
                {[0, 1, 2, 3].map((gridIndex) => {
                  const displayIndex = (currentImageIndex + gridIndex) % images.length;
                  const displayImage = images[displayIndex];
                  const imageSrc = `/assembly/photos/${displayImage.filename}`;
                  const isPreloaded = isImagePreloaded(imageSrc);
                  const isLoading = isResourceLoading(imageSrc);

                  return (
                    <div
                      key={`mobile-grid-${gridIndex}`}
                      className="relative group overflow-hidden bg-gray-100"
                    >
                      {/* 로딩 상태 표시 */}
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse z-5 flex items-center justify-center">
                          <div className="text-gray-400 text-xs">로딩 중...</div>
                        </div>
                      )}

                      {/* 이미지 */}
                      <div
                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                          isTransitioning ? 'opacity-95' : 'opacity-100'
                        }`}
                      >
                        <Image
                          src={imageSrc}
                          alt={displayImage.alt}
                          fill
                          className="object-cover transition-transform duration-300 group-active:scale-105"
                          sizes="50vw"
                          priority={gridIndex < 2}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAAAAAAAAAAAAAAAAAAAACv/EAB8QAAEEAwEBAQEAAAAAAAAAAAABAgMEBQYHCBESE//EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+SlPoABYxSM0GYAW7qNR7LWNR8YGNsaLvE4sFllYPWvEZGWvqXZjUyNOYO4VJlKhKB1WGKJK4IjDFxwqFGgMAB7jTcCRpGMFQQKZGOsrCgBTrWVu3G+nqUFdJyKNdI="
                          onLoad={() => {
                            // 이미지 로드 완료 시 다음 이미지들 프리로딩
                            if (gridIndex === 0) {
                              const nextIndex = (currentImageIndex + 4) % images.length;
                              smartPreload(nextIndex, images, 'image', 2);
                            }
                          }}
                        />
                      </div>

                      {/* 프리로딩 상태 표시 (개발 모드) */}
                      {process.env.NODE_ENV === 'development' && isPreloaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded z-10">
                          ✓
                        </div>
                      )}

                      {/* 이미지 정보 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 group-active:from-black/70 group-active:via-black/20 group-active:to-transparent transition-all duration-300 z-10">
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
          )}
        </div>
      </div>
    </section>
  );
}
