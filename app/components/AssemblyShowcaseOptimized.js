'use client';

import React, { useState, useEffect } from 'react';
import { Computer } from 'lucide-react';
import ImageGrid from './gallery/ImageGrid';
import VideoPlayer from './gallery/VideoPlayer';
import GalleryModal from './gallery/GalleryModal';
import { useGallery } from './hooks/useGallery';

// 설정 파일을 import (빌드 시 정적으로 로드됨)
import assemblyConfig from '../../public/assembly/config.json';

export default function AssemblyShowcaseOptimized() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [settings, setSettings] = useState({ muted: true, autoplay: true });

  const { images: configImages, videos: configVideos, settings: configSettings } = assemblyConfig;

  // 초기 설정만 단순하게 처리
  useEffect(() => {
    setImages(configImages);
    setVideos(configVideos);
    setSettings(configSettings);
  }, [configImages, configVideos, configSettings]);

  // 공통 로직 훅 사용
  const {
    currentImageIndex,
    currentVideoIndex,
    imageLoadErrors,
    isModalOpen,
    modalImageData,
    videoRef,
    handleVideoError,
    handleVideoEnded,
    handleImageError,
    handleImageClick,
    handleCloseModal,
  } = useGallery(images, videos, settings);

  // 렌더링 최적화 - 조건부 반환
  if (images.length === 0 && videos.length === 0) {
    return (
      <section className="py-6 sm:py-10 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 font-['NanumGothic']">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-96 flex items-center justify-center">
            <div className="text-center">
              <Computer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">새로고침 한번 눌려주세요.</p>
              <p className="text-gray-400 text-sm mt-2">조립 완성품 사진과 영상을 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-10 bg-gradient-to-b from-gray-50 to-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 font-['NanumGothic']">
        {/* 섹션 제목 - 이전 디자인 복원 */}
        <div className="text-center mb-2 sm:mb-1">
          <h2 className="text-2xl sm:text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#3661EB] to-[#87CEEB]">
            웰컴시스템 조립PC
          </h2>

          <div className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            <div>RGB로 빛나고, 성능으로 압도한다! 안 보이는 선정리도 깔끔하게!</div>
            <div className="-mt-1">
              35년간 10,000대 이상의 조립 경험, 수천 고객의 선택을 받은 믿음의 조립PC!
            </div>
          </div>
        </div>

        {/* 갤러리 컨테이너 - 이전 레이아웃 복원 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* 갤러리 메인 영역 - PC에서 제대로 보이도록 높이 설정 */}
          <div className="gallery-container flex flex-col md:flex-row md:h-[650px] gap-0.5">
            {/* 비디오 섹션 */}
            <VideoPlayer
              videos={videos}
              currentVideoIndex={currentVideoIndex}
              settings={settings}
              videoRef={videoRef}
              onVideoEnded={handleVideoEnded}
              onVideoError={handleVideoError}
            />

            {/* 이미지 그리드 섹션 */}
            <ImageGrid
              images={images}
              currentImageIndex={currentImageIndex}
              imageLoadErrors={imageLoadErrors}
              onImageClick={handleImageClick}
              onImageError={handleImageError}
            />
          </div>
        </div>
      </div>

      {/* 모달 */}
      <GalleryModal isOpen={isModalOpen} imageData={modalImageData} onClose={handleCloseModal} />
    </section>
  );
}
