'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useGallery(images, videos, settings) {
  // 상태 관리
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageData, setModalImageData] = useState(null);

  // ref 관리
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  // 이미지 자동 순환 - HeroSlider 방식
  const nextSlide = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // 자동 슬라이드 기능
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

  // 비디오 처리 로직
  const handleVideoError = useCallback((error) => {
    console.warn('비디오 재생 오류:', error);
  }, []);

  const handleVideoEnded = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  }, [videos.length]);

  // 동영상 인덱스 변경 시 처리
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

  // 이미지 에러 처리
  const handleImageError = useCallback((imageSrc) => {
    console.error(`이미지 로드 실패: ${imageSrc}`);
    setImageLoadErrors((prev) => new Set([...prev, imageSrc]));
  }, []);

  // 모달 관리
  const handleImageClick = useCallback((imageData, imageSrc) => {
    setModalImageData({
      ...imageData,
      src: imageSrc,
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalImageData(null);
  }, []);

  // 정리 함수
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // 상태
    currentImageIndex,
    currentVideoIndex,
    imageLoadErrors,
    isModalOpen,
    modalImageData,

    // ref
    videoRef,

    // 핸들러
    handleVideoError,
    handleVideoEnded,
    handleImageError,
    handleImageClick,
    handleCloseModal,

    // 유틸리티
    nextSlide,
  };
}
