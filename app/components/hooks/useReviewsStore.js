'use client';

import { useState, useCallback, useEffect } from 'react';

// 전역 상태 저장소
let globalReviews = [];
let globalLoading = false;
let globalError = null;
let globalLastFetch = 0;
let globalListeners = [];

const useReviewsStore = () => {
  const [reviews, setReviews] = useState(globalReviews);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState(globalError);
  const [lastFetch, setLastFetch] = useState(globalLastFetch);

  // 리스너 등록/해제
  useEffect(() => {
    const listener = (newState) => {
      setReviews(newState.reviews);
      setLoading(newState.loading);
      setError(newState.error);
      setLastFetch(newState.lastFetch);
    };

    globalListeners.push(listener);

    return () => {
      const index = globalListeners.indexOf(listener);
      if (index > -1) {
        globalListeners.splice(index, 1);
      }
    };
  }, []);

  // 모든 컴포넌트에 상태 변경 알림
  const notifyAll = useCallback((newState) => {
    if (newState.reviews !== undefined) globalReviews = newState.reviews;
    if (newState.loading !== undefined) globalLoading = newState.loading;
    if (newState.error !== undefined) globalError = newState.error;
    if (newState.lastFetch !== undefined) globalLastFetch = newState.lastFetch;

    globalListeners.forEach((listener) =>
      listener({
        reviews: globalReviews,
        loading: globalLoading,
        error: globalError,
        lastFetch: globalLastFetch,
      })
    );
  }, []);

  const fetchReviews = useCallback(
    async (page = 1, limit = 10) => {
      notifyAll({ loading: true, error: null });

      try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const response = await fetch(
          `/api/reviews/active?page=${page}&limit=${limit}&t=${timestamp}&r=${randomId}&nocache=1`,
          {
            method: 'GET',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const activeReviews = data.reviews
          ? data.reviews.filter((review) => review.status === 'active')
          : data.filter((review) => review.status === 'active');

        // 첫 페이지면 교체, 추가 페이지면 병합
        const updatedReviews = page === 1 ? activeReviews : [...globalReviews, ...activeReviews];

        notifyAll({
          reviews: updatedReviews,
          loading: false,
          lastFetch: timestamp,
          hasMore: data.hasMore || false,
        });

        return activeReviews;
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        notifyAll({
          error: error.message,
          loading: false,
        });
        throw error;
      }
    },
    [notifyAll]
  );

  const clearCache = useCallback(() => {
    notifyAll({ reviews: [], lastFetch: 0 });
  }, [notifyAll]);

  const refreshReviews = useCallback(async () => {
    clearCache();
    return await fetchReviews();
  }, [clearCache, fetchReviews]);

  return {
    reviews,
    loading,
    error,
    lastFetch,
    fetchReviews,
    clearCache,
    refreshReviews,
  };
};

export default useReviewsStore;
