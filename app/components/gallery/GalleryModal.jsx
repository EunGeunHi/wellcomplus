'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function GalleryModal({ isOpen, imageData, onClose }) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
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
  }, [isOpen, onClose]);

  if (!isOpen || !imageData) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9998] p-4"
      style={{ zIndex: 9998 }}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[9999] bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-lg pointer-events-auto"
          aria-label="모달 닫기"
          style={{ zIndex: 9999 }}
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        {/* 이미지 컨테이너 */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imageData.src}
            alt={imageData.alt}
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
                {imageData.category}
              </span>
              <div className="w-px h-3 bg-white/30 flex-shrink-0"></div>
              <h3 className="text-lg font-bold mb-1">{imageData.title}</h3>
            </div>

            {imageData.description && (
              <p className="text-xs text-white/85 max-w-xl mx-auto leading-relaxed mb-2">
                {imageData.description}
              </p>
            )}
            <div className="text-xs text-white/50">X 버튼 또는 ESC 키로 닫기</div>
          </div>
        </div>
      </div>
    </div>
  );
}
