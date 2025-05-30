'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function usePreloader() {
  const [preloadedImages, setPreloadedImages] = useState(new Map());
  const [preloadedVideos, setPreloadedVideos] = useState(new Map());
  const [isPreloading, setIsPreloading] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(new Set());

  const imageCache = useRef(new Map());
  const videoCache = useRef(new Map());
  const loadingPromises = useRef(new Map());

  // 이미지 프리로딩 함수 (개선된 버전)
  const preloadImage = useCallback((src) => {
    // 이미 로딩 중이거나 완료된 경우 기존 Promise 반환
    if (loadingPromises.current.has(src)) {
      return loadingPromises.current.get(src);
    }

    // 이미 캐시된 경우 즉시 반환
    if (imageCache.current.has(src)) {
      return Promise.resolve(imageCache.current.get(src));
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();

      // 더 적극적인 로딩 설정
      img.crossOrigin = 'anonymous';
      img.loading = 'eager';
      img.decoding = 'sync';

      img.onload = () => {
        // 캐시에 저장
        imageCache.current.set(src, img);
        setPreloadedImages((prev) => new Map(prev).set(src, img));
        loadingPromises.current.delete(src);
        setLoadingQueue((prev) => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        resolve(img);
      };

      img.onerror = () => {
        console.error(`이미지 프리로딩 실패: ${src}`);
        loadingPromises.current.delete(src);
        setLoadingQueue((prev) => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        reject(new Error(`Failed to preload image: ${src}`));
      };

      setLoadingQueue((prev) => new Set(prev).add(src));
      img.src = src;
    });

    loadingPromises.current.set(src, promise);
    return promise;
  }, []);

  // 비디오 프리로딩 함수 (개선된 버전)
  const preloadVideo = useCallback((src) => {
    // 이미 로딩 중이거나 완료된 경우 기존 Promise 반환
    if (loadingPromises.current.has(src)) {
      return loadingPromises.current.get(src);
    }

    // 이미 캐시된 경우 즉시 반환
    if (videoCache.current.has(src)) {
      return Promise.resolve(videoCache.current.get(src));
    }

    const promise = new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      let resolved = false;

      const handleCanPlay = () => {
        if (resolved) return;
        resolved = true;

        // 캐시에 저장
        videoCache.current.set(src, video);
        setPreloadedVideos((prev) => new Map(prev).set(src, video));
        loadingPromises.current.delete(src);
        setLoadingQueue((prev) => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        cleanup();
        resolve(video);
      };

      const handleError = () => {
        if (resolved) return;
        resolved = true;

        console.error(`비디오 프리로딩 실패: ${src}`);
        loadingPromises.current.delete(src);
        setLoadingQueue((prev) => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        cleanup();
        reject(new Error(`Failed to preload video: ${src}`));
      };

      const cleanup = () => {
        video.removeEventListener('canplaythrough', handleCanPlay);
        video.removeEventListener('loadeddata', handleCanPlay);
        video.removeEventListener('error', handleError);
      };

      // 여러 이벤트로 더 빠른 감지
      video.addEventListener('canplaythrough', handleCanPlay);
      video.addEventListener('loadeddata', handleCanPlay);
      video.addEventListener('error', handleError);

      setLoadingQueue((prev) => new Set(prev).add(src));
      video.src = src;
    });

    loadingPromises.current.set(src, promise);
    return promise;
  }, []);

  // 여러 이미지 일괄 프리로딩 (개선된 버전)
  const preloadImages = useCallback(
    async (imagePaths) => {
      if (imagePaths.length === 0) return;

      setIsPreloading(true);
      try {
        // 병렬 로딩이지만 순차적으로 시작 (네트워크 병목 방지)
        const promises = [];

        for (let i = 0; i < imagePaths.length; i++) {
          promises.push(preloadImage(imagePaths[i]));
          // 50ms 간격으로 시작하여 네트워크 부하 분산
          if (i < imagePaths.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }

        await Promise.allSettled(promises);
      } catch (error) {
        console.error('이미지 일괄 프리로딩 중 오류:', error);
      } finally {
        setIsPreloading(false);
      }
    },
    [preloadImage]
  );

  // 여러 비디오 일괄 프리로딩 (개선된 버전)
  const preloadVideos = useCallback(
    async (videoPaths) => {
      if (videoPaths.length === 0) return;

      setIsPreloading(true);
      try {
        // 비디오는 더 신중하게 순차 로딩
        const promises = [];

        for (let i = 0; i < videoPaths.length; i++) {
          promises.push(preloadVideo(videoPaths[i]));
          // 100ms 간격으로 시작 (비디오는 더 큰 파일)
          if (i < videoPaths.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        await Promise.allSettled(promises);
      } catch (error) {
        console.error('비디오 일괄 프리로딩 중 오류:', error);
      } finally {
        setIsPreloading(false);
      }
    },
    [preloadVideo]
  );

  // 적극적 스마트 프리로딩 (크게 개선된 버전)
  const smartPreload = useCallback(
    async (currentIndex, items, type = 'image', preloadCount = 2) => {
      if (!items || items.length === 0) return;

      const pathsToPreload = [];

      // 현재 + 다음 + 이전도 프리로딩 (순환 갤러리 대비)
      for (let i = -1; i <= preloadCount; i++) {
        const index = (currentIndex + i + items.length) % items.length;
        const item = items[index];
        if (item) {
          const path =
            type === 'image'
              ? `/assembly/photos/${item.filename}`
              : `/assembly/videos/${item.filename}`;

          // 이미 캐시된 것은 제외
          const isCached =
            type === 'image' ? imageCache.current.has(path) : videoCache.current.has(path);

          if (!isCached) {
            pathsToPreload.push(path);
          }
        }
      }

      if (pathsToPreload.length === 0) return;

      if (type === 'image') {
        await preloadImages(pathsToPreload);
      } else {
        await preloadVideos(pathsToPreload);
      }
    },
    [preloadImages, preloadVideos]
  );

  // 사전 예측 프리로딩 (새로운 기능)
  const predictivePreload = useCallback(
    async (currentIndex, items, type = 'image') => {
      if (!items || items.length === 0) return;

      // 다음 5개까지 미리 로딩 (적극적 프리로딩)
      const pathsToPreload = [];
      for (let i = 1; i <= 5; i++) {
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

      // 백그라운드에서 비동기 로딩 (메인 스레드 블록하지 않음)
      if (type === 'image') {
        preloadImages(pathsToPreload).catch(() => {}); // 에러 무시
      } else {
        preloadVideos(pathsToPreload).catch(() => {}); // 에러 무시
      }
    },
    [preloadImages, preloadVideos]
  );

  // 지능형 메모리 정리 함수 (개선된 버전)
  const cleanupOldCache = useCallback((keepCount = 10) => {
    // 더 관대한 캐시 정책 (성능 우선)

    // 이미지 캐시 정리 (사용 빈도 고려)
    if (imageCache.current.size > keepCount * 2) {
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

    // 비디오 캐시 정리 (더 신중하게)
    if (videoCache.current.size > keepCount) {
      const entries = Array.from(videoCache.current.entries());
      const toDelete = entries.slice(0, entries.length - keepCount);

      toDelete.forEach(([key, video]) => {
        // 메모리 해제 전에 정리
        video.pause();
        video.src = '';
        video.load();
        videoCache.current.delete(key);
      });

      setPreloadedVideos((prev) => {
        const newMap = new Map(prev);
        toDelete.forEach(([key]) => newMap.delete(key));
        return newMap;
      });
    }
  }, []);

  // 프리로딩된 리소스 직접 획득
  const getPreloadedImage = useCallback((src) => {
    return imageCache.current.get(src);
  }, []);

  const getPreloadedVideo = useCallback((src) => {
    return videoCache.current.get(src);
  }, []);

  // 캐시 확인 함수
  const isImagePreloaded = useCallback((src) => {
    return imageCache.current.has(src);
  }, []);

  const isVideoPreloaded = useCallback((src) => {
    return videoCache.current.has(src);
  }, []);

  // 로딩 상태 확인
  const isResourceLoading = useCallback(
    (src) => {
      return loadingQueue.has(src);
    },
    [loadingQueue]
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 모든 로딩 중인 Promise 정리
      loadingPromises.current.clear();

      // 모든 비디오 정리
      videoCache.current.forEach((video) => {
        video.pause();
        video.src = '';
        video.load();
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
    predictivePreload,
    cleanupOldCache,
    getPreloadedImage,
    getPreloadedVideo,
    isImagePreloaded,
    isVideoPreloaded,
    isResourceLoading,
    isPreloading,
    preloadedImages,
    preloadedVideos,
    loadingQueue,
  };
}
