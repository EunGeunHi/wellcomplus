'use client';

import React from 'react';
import Image from 'next/image';

export default function ImageGrid({
  images,
  currentImageIndex,
  imageLoadErrors,
  onImageClick,
  onImageError,
}) {
  if (!images || images.length === 0) {
    return (
      <div className="image-grid-section grid grid-cols-2 grid-rows-2 h-[200px] sm:h-[260px] md:w-1/2 md:h-full gap-0.5">
        <div className="flex items-center justify-center text-gray-400 col-span-2 row-span-2">
          이미지가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="image-grid-section grid grid-cols-2 grid-rows-2 h-[200px] sm:h-[260px] md:w-1/2 md:h-full gap-0.5">
      {[0, 1, 2, 3].map((gridIndex) => {
        const displayIndex = (currentImageIndex + gridIndex) % images.length;
        const displayImage = images[displayIndex];
        const imageSrc = `/assembly/photos/${displayImage.filename}`;

        return (
          <div
            key={`grid-${gridIndex}`}
            className="relative group overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => onImageClick(displayImage, imageSrc)}
          >
            {/* 이미지 */}
            <div className="absolute inset-0 transition-all duration-300 ease-in-out">
              {!imageLoadErrors.has(imageSrc) ? (
                <Image
                  src={imageSrc}
                  alt={displayImage.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 group-active:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={false} // priority 제거하여 preload 경고 해결
                  loading="lazy" // 모든 이미지를 지연 로딩으로 설정
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAAAAAAAAAAAAAAAAAAAACv/EAB8QAAEEAwEBAQEAAAAAAAAAAAABAgMEBQYHCBESE//EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+SlPoABYxSM0GYAW7qNR7LWNR8YGNsaLvE4sFllYPWvEZGWvqXZjUyNOYO4VJlKhKB1WGKJK4IjDFxwqFGgMAB7jTcCRpGMFQQKZGOsrCgBTrWVu3G+nqUFdJyKNdI="
                  onError={() => onImageError(imageSrc)}
                  onLoad={() => {
                    // 이미지 로딩 완료 처리
                  }}
                />
              ) : (
                // 이미지 로드 실패 시 플레이스홀더
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
                    <p className="text-xs">로드중...</p>
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
  );
}
