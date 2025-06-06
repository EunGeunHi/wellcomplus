'use client';

import React from 'react';

export default function VideoPlayer({
  videos,
  currentVideoIndex,
  settings,
  videoRef,
  onVideoEnded,
  onVideoError,
}) {
  if (!videos || videos.length === 0) {
    return (
      <div className="video-section relative bg-black h-[200px] sm:h-[260px] md:w-1/2 md:h-full">
        <div className="w-full h-full flex items-center justify-center text-white">동영상 없음</div>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="video-section relative bg-black h-[200px] sm:h-[260px] md:w-1/2 md:h-full">
      <div className="absolute inset-0">
        <video
          key="unified-video-player"
          ref={videoRef}
          className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
          autoPlay
          muted={settings.muted}
          loop={false}
          playsInline
          preload="metadata"
          loading="lazy"
          onEnded={onVideoEnded}
          onError={onVideoError}
          onLoadStart={() => {
            // 로딩 시작 시 처리
            if (videoRef.current) {
              videoRef.current.style.opacity = '0.7';
            }
          }}
          onCanPlay={() => {
            // 재생 가능할 때 처리
            if (videoRef.current) {
              videoRef.current.style.opacity = '1';
            }
          }}
        >
          <source src={`/assembly/videos/${currentVideo.filename}`} type="video/mp4" />
          동영상을 지원하지 않는 브라우저입니다.
        </video>
      </div>

      {/* 동영상 정보 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 md:p-6 z-10 transition-opacity duration-300">
        <h3 className="text-white font-bold text-sm sm:text-lg md:text-xl mb-1">
          {currentVideo.title}
        </h3>
        <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
          {currentVideo.description}
        </p>
      </div>
    </div>
  );
}
