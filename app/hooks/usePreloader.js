'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function usePreloader() {
  const [preloadedImages, setPreloadedImages] = useState(new Map());
  const [preloadedVideos, setPreloadedVideos] = useState(new Map());
  const [isPreloading, setIsPreloading] = useState(false);

  const imageCache = useRef(new Map());
  const videoCache = useRef(new Map());

  // 이미지 프리로딩 함수
  const preloadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      // 이미 캐시된 경우 즉시 반환
      if (imageCache.current.has(src)) {
        resolve(imageCache.current.get(src));
        return;
      }

      const img = new Image();

      img.onload = () => {
        // 캐시에 저장
        imageCache.current.set(src, img);
        setPreloadedImages((prev) => new Map(prev).set(src, img));
        resolve(img);
      };

      img.onerror = () => {
        console.error(`이미지 프리로딩 실패: ${src}`);
        reject(new Error(`Failed to preload image: ${src}`));
      };

      img.src = src;
    });
  }, []);

  // 비디오 프리로딩 함수
  const preloadVideo = useCallback((src) => {
    return new Promise((resolve, reject) => {
      // 이미 캐시된 경우 즉시 반환
      if (videoCache.current.has(src)) {
        resolve(videoCache.current.get(src));
        return;
      }

      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true; // 자동재생을 위해 음소거

      const handleCanPlay = () => {
        // 캐시에 저장
        videoCache.current.set(src, video);
        setPreloadedVideos((prev) => new Map(prev).set(src, video));
        resolve(video);
        cleanup();
      };

      const handleError = () => {
        console.error(`비디오 프리로딩 실패: ${src}`);
        reject(new Error(`Failed to preload video: ${src}`));
        cleanup();
      };

      const cleanup = () => {
        video.removeEventListener('canplaythrough', handleCanPlay);
        video.removeEventListener('error', handleError);
      };

      video.addEventListener('canplaythrough', handleCanPlay);
      video.addEventListener('error', handleError);
      video.src = src;
    });
  }, []);

  // 여러 이미지 일괄 프리로딩
  const preloadImages = useCallback(
    async (imagePaths) => {
      setIsPreloading(true);
      try {
        const promises = imagePaths.map((path) => preloadImage(path));
        await Promise.allSettled(promises); // 일부 실패해도 계속 진행
      } catch (error) {
        console.error('이미지 일괄 프리로딩 중 오류:', error);
      } finally {
        setIsPreloading(false);
      }
    },
    [preloadImage]
  );

  // 여러 비디오 일괄 프리로딩
  const preloadVideos = useCallback(
    async (videoPaths) => {
      setIsPreloading(true);
      try {
        const promises = videoPaths.map((path) => preloadVideo(path));
        await Promise.allSettled(promises); // 일부 실패해도 계속 진행
      } catch (error) {
        console.error('비디오 일괄 프리로딩 중 오류:', error);
      } finally {
        setIsPreloading(false);
      }
    },
    [preloadVideo]
  );

  // 스마트 프리로딩 (현재 + 다음 몇 개)
  const smartPreload = useCallback(
    async (currentIndex, items, type = 'image', preloadCount = 2) => {
      if (!items || items.length === 0) return;

      const pathsToPreload = [];

      // 현재부터 다음 preloadCount개까지 프리로딩
      for (let i = 0; i <= preloadCount; i++) {
        const index = (currentIndex + i) % items.length;
        const item = items[index];
        if (item) {
          const path =
            type === 'image'
              ? `/assembly/photos/${item.filename}`
              : `/assembly/videos/${item.filename}`;
          pathsToPreload.push(path);
        }
      }

      if (type === 'image') {
        await preloadImages(pathsToPreload);
      } else {
        await preloadVideos(pathsToPreload);
      }
    },
    [preloadImages, preloadVideos]
  );

  // 메모리 정리 함수
  const cleanupOldCache = useCallback((keepCount = 5) => {
    // 이미지 캐시 정리
    if (imageCache.current.size > keepCount) {
      const entries = Array.from(imageCache.current.entries());
      const toDelete = entries.slice(0, entries.length - keepCount);

      toDelete.forEach(([key]) => {
        imageCache.current.delete(key);
      });

      setPreloadedImages((prev) => {
        const newMap = new Map(prev);
        toDelete.forEach(([key]) => newMap.delete(key));
        return newMap;
      });
    }

    // 비디오 캐시 정리
    if (videoCache.current.size > keepCount) {
      const entries = Array.from(videoCache.current.entries());
      const toDelete = entries.slice(0, entries.length - keepCount);

      toDelete.forEach(([key, video]) => {
        video.src = ''; // 메모리 해제
        videoCache.current.delete(key);
      });

      setPreloadedVideos((prev) => {
        const newMap = new Map(prev);
        toDelete.forEach(([key]) => newMap.delete(key));
        return newMap;
      });
    }
  }, []);

  // 캐시 확인 함수
  const isImagePreloaded = useCallback((src) => {
    return imageCache.current.has(src);
  }, []);

  const isVideoPreloaded = useCallback((src) => {
    return videoCache.current.has(src);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 모든 비디오 정리
      videoCache.current.forEach((video) => {
        video.src = '';
      });
      videoCache.current.clear();
      imageCache.current.clear();
    };
  }, []);

  return {
    preloadImage,
    preloadVideo,
    preloadImages,
    preloadVideos,
    smartPreload,
    cleanupOldCache,
    isImagePreloaded,
    isVideoPreloaded,
    isPreloading,
    preloadedImages,
    preloadedVideos,
  };
}
