'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Computer, X } from 'lucide-react';
// useMediaQuery 훅 제거 - CSS 기반으로 전환
// import { useMediaQuery } from '../hooks/useMediaQuery';

// 설정 파일을 import (빌드 시 정적으로 로드됨)
import assemblyConfig from '../../public/assembly/config.json';

export default function AssemblyShowcaseOptimized() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [settings, setSettings] = useState({ muted: true, autoplay: true });

  // HeroSlider처럼 단순한 에러 상태만 관리
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageData, setModalImageData] = useState(null);

  // 기존 비디오 ref 제거, 하나로 통합
  // const videoRefDesktop = useRef(null);
  // const videoRefMobile = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  // useMediaQuery 제거 - CSS로 반응형 처리
  // const isDesktop = useMediaQuery('(min-width: 768px)');

  const { images: configImages, videos: configVideos, settings: configSettings } = assemblyConfig;

  // 초기 설정만 단순하게 처리
  useEffect(() => {
    setImages(configImages);
    setVideos(configVideos);
    setSettings(configSettings);
  }, [configImages, configVideos, configSettings]);

  // 이미지 자동 순환을 HeroSlider 방식으로 단순화
  const nextSlide = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // HeroSlider와 동일한 단순한 자동 슬라이드 기능
  useEffect(() => {
    if (images.length === 0) return;

    // 기존 인터벌 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 새 인터벌 설정
    intervalRef.current = setInterval(nextSlide, settings.imageRotationInterval || 3000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nextSlide, images.length, settings.imageRotationInterval]);

  // 비디오 처리 로직 대폭 간소화 - HeroSlider 방식 적용
  const handleVideoError = useCallback((error) => {
    console.warn('비디오 재생 오류:', error);
  }, []);

  // 단순한 동영상 자동 순환 - HeroSlider 방식
  const handleVideoEnded = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  }, [videos.length]);

  // 동영상 인덱스 변경 시 단순한 처리
  useEffect(() => {
    if (videos.length === 0 || !videoRef.current) return;

    const video = videoRef.current;
    const videoSrc = `/assembly/videos/${videos[currentVideoIndex].filename}`;
    const source = video.querySelector('source');

    if (source && source.src !== videoSrc) {
      source.src = videoSrc;
      video.load();
    }
  }, [currentVideoIndex, videos]);

  // 이미지 클릭 핸들러 - 단순화
  const handleImageClick = useCallback(
    (imageData, imageSrc) => {
      // 복잡한 캐시 확인 로직 제거
      setModalImageData({
        ...imageData,
        src: imageSrc,
      });
      setIsModalOpen(true);
    },
    [] // isImagePreloaded, smartPreload 제거
  );

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalImageData(null);
  }, []);

  // ESC 키로 모달 닫기 - 정리된 버전
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      // 모달 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, handleCloseModal]);

  // 렌더링 최적화 - 조건부 반환
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
        <div className="text-center mb-2 sm:mb-1">
          <h2 className="text-2xl sm:text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#3661EB] to-[#87CEEB]">
            웰컴시스템 조립PC
          </h2>

          <div className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            <div>35년 장인의 손끝에서 완성된 PC, 그 정점이 여기에 있습니다!</div>
            <div className="-mt-1">
              RGB로 빛나고, 성능으로 압도하는 웰컴시스템에서 조립PC를 경험하세요!
            </div>
          </div>
        </div>

        {/* 갤러리 컨테이너 - CSS 기반 반응형으로 통합 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* 기존 JavaScript 조건부 렌더링 제거 */}
          {/* 통합된 반응형 레이아웃 */}
          <div className="gallery-container flex flex-col md:flex-row md:h-[650px] gap-0.5">
            {/* 비디오 섹션 - CSS로 반응형 처리 */}
            <div className="video-section relative bg-black h-[200px] sm:h-[260px] md:w-1/2 md:h-auto">
              {videos.length > 0 ? (
                <div className="absolute inset-0">
                  <video
                    key="unified-video-player"
                    ref={videoRef}
                    className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                    autoPlay
                    muted={settings.muted}
                    loop={false}
                    playsInline
                    preload="auto"
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 md:p-6 z-10 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-sm sm:text-lg md:text-xl mb-1">
                    {videos[currentVideoIndex].title}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                    {videos[currentVideoIndex].description}
                  </p>
                </div>
              )}
            </div>

            {/* 이미지 그리드 섹션 - CSS로 반응형 처리 */}
            <div className="image-grid-section grid grid-cols-2 grid-rows-2 h-[200px] sm:h-[260px] md:w-1/2 md:h-auto gap-0.5">
              {[0, 1, 2, 3].map((gridIndex) => {
                const displayIndex = (currentImageIndex + gridIndex) % images.length;
                const displayImage = images[displayIndex];
                const imageSrc = `/assembly/photos/${displayImage.filename}`;

                return (
                  <div
                    key={`unified-grid-${gridIndex}`}
                    className="relative group overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => handleImageClick(displayImage, imageSrc)}
                  >
                    {/* 이미지 */}
                    <div className="absolute inset-0 transition-all duration-300 ease-in-out">
                      {/* HeroSlider처럼 에러 처리만 추가 */}
                      {!imageLoadErrors.has(imageSrc) ? (
                        <Image
                          src={imageSrc}
                          alt={displayImage.alt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105 group-active:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          priority={gridIndex < 2}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAAAAAAAAAAAAAAAAAAAACv/EAB8QAAEEAwEBAQEAAAAAAAAAAAABAgMEBQYHCBESE//EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+SlPoABYxSM0GYAW7qNR7LWNR8YGNsaLvE4sFllYPWvEZGWvqXZjUyNOYO4VJlKhKB1WGKJK4IjDFxwqFGgMAB7jTcCRpGMFQQKZGOsrCgBTrWVu3G+nqUFdJyKNdI="
                          onError={() => {
                            console.error(`이미지 로드 실패: ${imageSrc}`);
                            setImageLoadErrors((prev) => new Set([...prev, imageSrc]));
                          }}
                        />
                      ) : (
                        // 이미지 로드 실패 시 플레이스홀더 (HeroSlider와 동일)
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <svg
                              className="w-8 h-8 mx-auto mb-1"
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
                            <p className="text-xs">로드 실패</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 이미지 정보 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 group-hover:from-black/70 group-hover:via-black/20 group-hover:to-transparent group-active:from-black/70 group-active:via-black/20 group-active:to-transparent transition-all duration-300 md:duration-500 z-10">
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 transform translate-y-full group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-300 md:duration-500 ease-out">
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1">
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 bg-[#3661EB] rounded-full"></div>
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
        </div>
      </div>

      {/* 이미지 모달 */}
      {isModalOpen && modalImageData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9998] p-4"
          style={{ zIndex: 9998 }}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* 닫기 버튼 */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-[9999] bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-lg pointer-events-auto"
              aria-label="모달 닫기"
              style={{ zIndex: 9999 }}
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>

            {/* 이미지 컨테이너 */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={modalImageData.src}
                alt={modalImageData.alt}
                fill
                className="object-contain"
                sizes="90vw"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAAAAAAAAAAAAAAAAAAAACv/EAB8QAAEEAwEBAQEAAAAAAAAAAAABAgMEBQYHCBESE//EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+SlPoABYxSM0GYAW7qNR7LWNR8YGNsaLvE4sFllYPWvEZGWvqXZjUyNOYO4VJlKhKB1WGKJK4IjDFxwqFGgMAB7jTcCRpGMFQQKZGOsrCgBTrWVu3G+nqUFdJyKNdI="
              />
            </div>

            {/* 이미지 정보 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 bg-[#3661EB] rounded-full"></div>
                  <span className="text-xs font-medium uppercase tracking-wide text-white/80">
                    {modalImageData.category}
                  </span>
                  <div className="w-px h-3 bg-white/30 flex-shrink-0"></div>
                  <h3 className="text-lg font-bold mb-1">{modalImageData.title}</h3>
                </div>

                {modalImageData.description && (
                  <p className="text-xs text-white/85 max-w-xl mx-auto leading-relaxed mb-2">
                    {modalImageData.description}
                  </p>
                )}
                <div className="text-xs text-white/50">X 버튼 또는 ESC 키로 닫기</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
