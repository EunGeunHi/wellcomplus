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
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [isRotationActive, setIsRotationActive] = useState(false);

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

  // 초기 이미지들 완전 프리로딩 함수
  const preloadInitialImages = useCallback(async () => {
    if (configImages.length === 0) return;

    try {
      // 첫 8개 이미지를 완전히 프리로딩 (2바퀴 분량)
      const initialLoadCount = Math.min(8, configImages.length);

      await smartPreload(0, configImages, 'image', initialLoadCount - 1);

      // 모든 초기 이미지가 프리로딩될 때까지 대기
      let allLoaded = false;
      let attempts = 0;
      const maxAttempts = 50; // 5초 타임아웃

      while (!allLoaded && attempts < maxAttempts) {
        allLoaded = true;

        for (let i = 0; i < initialLoadCount; i++) {
          const imageSrc = `/assembly/photos/${configImages[i].filename}`;
          if (!isImagePreloaded(imageSrc)) {
            allLoaded = false;
            break;
          }
        }

        if (!allLoaded) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }
      }

      setIsInitialLoadComplete(true);

      // 프리로딩 완료 후 0.5초 뒤에 자동 순환 시작
      setTimeout(() => {
        setIsRotationActive(true);
      }, 500);
    } catch (error) {
      console.error('초기 프리로딩 실패:', error);
      // 실패해도 3초 후 자동 순환 시작
      setTimeout(() => {
        setIsInitialLoadComplete(true);
        setIsRotationActive(true);
      }, 3000);
    }
  }, [configImages, smartPreload, isImagePreloaded]);

  // 적극적 초기 프리로딩 실행
  useEffect(() => {
    setImages(configImages);
    setVideos(configVideos);
    setSettings(configSettings);

    if (configImages.length > 0) {
      // 초기 이미지 완전 프리로딩
      preloadInitialImages();

      // 백그라운드에서 나머지 이미지들도 예측 프리로딩
      setTimeout(() => {
        predictivePreload(0, configImages, 'image');
      }, 2000);
    }

    if (configVideos.length > 0) {
      smartPreload(0, configVideos, 'video', 2); // 처음 3개 비디오 프리로딩
      // 백그라운드에서 다음 비디오들 예측 프리로딩
      setTimeout(() => {
        predictivePreload(0, configVideos, 'video');
      }, 3000);
    }
  }, [
    configImages,
    configVideos,
    configSettings,
    preloadInitialImages,
    smartPreload,
    predictivePreload,
  ]);

  // 다음 이미지 준비 상태 확인 함수
  const isNextImageReady = useCallback(
    (nextIndex) => {
      if (images.length === 0) return false;

      // 다음 4개 이미지가 모두 프리로딩되었는지 확인
      for (let i = 0; i < 4; i++) {
        const checkIndex = (nextIndex + i) % images.length;
        const imageSrc = `/assembly/photos/${images[checkIndex].filename}`;
        if (!isImagePreloaded(imageSrc)) {
          return false;
        }
      }
      return true;
    },
    [images, isImagePreloaded]
  );

  // 사전 예측 프리로딩 (이미지 변경 전에 미리 준비)
  const preloadNextResources = useCallback(
    async (currentImgIndex, currentVidIndex) => {
      // 다음 이미지들 적극적 프리로딩 (현재 + 다음 5개)
      await smartPreload(currentImgIndex, images, 'image', 5);

      // 다음 비디오 프리로딩 (현재 + 다음 1개)
      smartPreload(currentVidIndex, videos, 'video', 1);

      // 백그라운드 예측 프리로딩
      setTimeout(() => {
        predictivePreload(currentImgIndex, images, 'image');
      }, 100);
    },
    [images, videos, smartPreload, predictivePreload]
  );

  // 개선된 이미지 자동 순환 (프리로딩 완료 확인 후 변경)
  useEffect(() => {
    if (images.length === 0 || !isRotationActive) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIndex = (prev + 1) % images.length;

        // 다음 이미지가 준비되었는지 확인
        if (!isNextImageReady(nextIndex)) {
          // 준비되지 않았으면 강제로 프리로딩하고 잠시 대기
          preloadNextResources(nextIndex, currentVideoIndex);
          return prev; // 이번 변경은 건너뛰기
        }

        setIsTransitioning(true);

        // 이미지 변경 후 다음 리소스들 미리 프리로딩
        preloadNextResources(nextIndex, currentVideoIndex);

        // 전환 애니메이션 완료 후 상태 초기화
        setTimeout(() => setIsTransitioning(false), 150);

        return nextIndex;
      });
    }, settings.imageRotationInterval);

    intervalRef.current = interval;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    images.length,
    settings.imageRotationInterval,
    isRotationActive,
    isNextImageReady,
    preloadNextResources,
    currentVideoIndex,
  ]);

  // 향상된 동영상 처리 함수
  const playVideoSmoothly = useCallback(
    async (videoElement, videoSrc) => {
      if (!videoElement) return;

      try {
        // 현재 비디오 상태 확인
        const isCurrentSrc = videoElement.querySelector('source')?.src === videoSrc;
        const isPlaying =
          !videoElement.paused && !videoElement.ended && videoElement.readyState > 2;

        // 이미 같은 소스가 재생 중이면 스킵
        if (isCurrentSrc && isPlaying) {
          return;
        }

        // 현재 재생 중인 비디오가 있으면 일시정지
        if (!videoElement.paused) {
          videoElement.pause();
        }

        // 프리로딩된 비디오가 있는지 확인
        const preloadedVideo = getPreloadedVideo(videoSrc);

        if (preloadedVideo) {
          // 프리로딩된 비디오 사용 (끊김 없는 전환)
          const source = videoElement.querySelector('source');
          if (source && source.src !== videoSrc) {
            source.src = videoSrc;

            // load() 후 충분한 대기 시간
            videoElement.load();

            // loadstart 이벤트를 기다려서 안전하게 재생
            await new Promise((resolve, reject) => {
              let resolved = false;

              const handleLoadStart = () => {
                if (resolved) return;
                resolved = true;
                videoElement.removeEventListener('loadstart', handleLoadStart);
                videoElement.removeEventListener('error', handleError);
                resolve();
              };

              const handleError = (e) => {
                if (resolved) return;
                resolved = true;
                videoElement.removeEventListener('loadstart', handleLoadStart);
                videoElement.removeEventListener('error', handleError);
                reject(e);
              };

              videoElement.addEventListener('loadstart', handleLoadStart);
              videoElement.addEventListener('error', handleError);

              // 1초 타임아웃 (충분한 시간)
              setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  videoElement.removeEventListener('loadstart', handleLoadStart);
                  videoElement.removeEventListener('error', handleError);
                  resolve(); // 타임아웃이어도 계속 진행
                }
              }, 1000);
            });
          }

          // 재생 전 상태 재확인
          if (videoElement.readyState >= 3) {
            // 재생 시도 (AbortError 방지)
            try {
              await videoElement.play();
            } catch (playError) {
              // AbortError는 무시 (정상적인 전환 과정)
              if (playError.name === 'AbortError') {
                // console.log('이전 재생이 중단됨 (정상)');
                return;
              }
              // 다른 에러는 재시도
              setTimeout(async () => {
                try {
                  await videoElement.play();
                } catch (retryError) {
                  if (retryError.name !== 'AbortError') {
                    console.warn('비디오 재생 재시도 실패:', retryError.message);
                  }
                }
              }, 100);
            }
          }
        } else {
          // 프리로딩되지 않은 경우 기존 방식 (개선됨)
          const source = videoElement.querySelector('source');
          if (source) {
            source.src = videoSrc;
            videoElement.load();

            // canplay 이벤트 대기 후 재생
            await new Promise((resolve, reject) => {
              let resolved = false;

              const handleCanPlay = () => {
                if (resolved) return;
                resolved = true;
                cleanup();
                resolve();
              };

              const handleError = (e) => {
                if (resolved) return;
                resolved = true;
                cleanup();
                reject(new Error(`Video load failed: ${e.message || 'Unknown error'}`));
              };

              const cleanup = () => {
                videoElement.removeEventListener('canplay', handleCanPlay);
                videoElement.removeEventListener('loadeddata', handleCanPlay);
                videoElement.removeEventListener('error', handleError);
              };

              videoElement.addEventListener('canplay', handleCanPlay);
              videoElement.addEventListener('loadeddata', handleCanPlay);
              videoElement.addEventListener('error', handleError);

              // 3초 타임아웃 (더 짧게)
              setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  cleanup();
                  reject(new Error('Video load timeout'));
                }
              }, 3000);
            });

            // 안전한 재생 시도
            try {
              await videoElement.play();
            } catch (playError) {
              if (playError.name === 'AbortError') {
                // AbortError는 정상적인 전환 과정
                return;
              }
              throw playError;
            }
          }
        }
      } catch (error) {
        // AbortError는 정상적인 상황이므로 로그 출력 안함
        if (error.name === 'AbortError') {
          return;
        }

        // 실제 에러만 로그 출력
        if (error.message && !error.message.includes('interrupted')) {
          console.warn('비디오 재생 문제:', error.message);
        }
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
      cleanupOldCache(20); // 더욱 관대한 캐시 정책 (첫 로딩 성능 우선)
    }, 90000); // 1.5분마다 정리

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
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-1 space-x-2">
              {!isInitialLoadComplete && <span>📦 초기 로딩 중...</span>}
              {isPreloading && <span>🔄 프리로딩 중...</span>}
              {isTransitioning && <span>✨ 전환 중...</span>}
              {isRotationActive && <span>🎯 순환 활성</span>}
            </div>
          )} */}
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
                        className={`absolute inset-0 transition-all duration-300 ease-in-out ${
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
                            // 이미지 로드 완료 시 다음 이미지들 적극적 프리로딩
                            if (gridIndex === 0) {
                              const nextIndex = (currentImageIndex + 4) % images.length;
                              smartPreload(nextIndex, images, 'image', 4);
                            }
                          }}
                        />
                      </div>

                      {/* 프리로딩 상태 표시 (개발 모드) */}
                      {/* {process.env.NODE_ENV === 'development' && isPreloaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded z-10">
                          ✓
                        </div>
                      )} */}

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
                        className={`absolute inset-0 transition-all duration-300 ease-in-out ${
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
                            // 이미지 로드 완료 시 다음 이미지들 적극적 프리로딩
                            if (gridIndex === 0) {
                              const nextIndex = (currentImageIndex + 4) % images.length;
                              smartPreload(nextIndex, images, 'image', 4);
                            }
                          }}
                        />
                      </div>

                      {/* 프리로딩 상태 표시 (개발 모드) */}
                      {/* {process.env.NODE_ENV === 'development' && isPreloaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded z-10">
                          ✓
                        </div>
                      )} */}

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
