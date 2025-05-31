'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDate } from '@/utils/dateFormat';
import useReviewsStore from '@/app/components/hooks/useReviewsStore';

const ReviewCard = ({
  review,
  onClick,
  isVisible = true,
  imageCache = null,
  cacheStats = null,
}) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      );
    }
    return stars;
  };

  const getServiceTypeInKorean = (type) => {
    const serviceTypes = {
      computer: '컴퓨터',
      printer: '프린터',
      notebook: '노트북',
      as: 'AS서비스',
      other: '기타서비스',
    };
    return serviceTypes[type] || type;
  };

  // 캐시된 이미지 확인 함수
  const getCachedImageSrc = (imageUrl) => {
    if (imageCache && imageCache.current && imageCache.current.has(imageUrl)) {
      const cachedImg = imageCache.current.get(imageUrl);
      if (cacheStats && cacheStats.current) {
        cacheStats.current.hits++;
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `🎯 캐시 히트: ${imageUrl.substring(0, 50)}... (히트: ${cacheStats.current.hits}, 미스: ${cacheStats.current.misses})`
          );
        }
      }
      return cachedImg.src;
    }
    if (cacheStats && cacheStats.current) {
      cacheStats.current.misses++;
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `❌ 캐시 미스: ${imageUrl.substring(0, 50)}... (히트: ${cacheStats.current.hits}, 미스: ${cacheStats.current.misses})`
        );
      }
    }
    return imageUrl;
  };

  // 이미지 로드 에러 처리
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    // 플레이스홀더 표시
    const placeholder = e.target.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  // 이미지 로드 성공 처리
  const handleImageLoad = (e) => {
    // 플레이스홀더 숨기기
    const placeholder = e.target.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 w-full h-full min-h-[220px] sm:min-h-[260px] cursor-pointer"
      onClick={() => onClick(review)}
    >
      {/* 카드 상단 테두리 라인 */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

      <div className="p-3 sm:p-4 flex flex-col h-full">
        {/* 사용자 이름 */}
        <div className="mb-1">
          <p className="font-bold text-gray-800 text-sm sm:text-base leading-tight">
            {review.userId && review.userId.name ? review.userId.name : '익명'} 님
          </p>
        </div>

        {/* 서비스 타입과 별점 */}
        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {getServiceTypeInKorean(review.serviceType)}
          </span>
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-0.5">{renderStars(review.rating)}</div>
            <span className="ml-1 sm:ml-1.5 text-xs font-semibold text-gray-700">
              {review.rating}점
            </span>
          </div>
        </div>

        {/* 이미지 섹션 */}
        {review.images && review.images.length > 0 && (
          <div className="mb-1">
            <div className="flex space-x-1 sm:space-x-1.5 overflow-x-auto scrollbar-hide pb-1">
              {review.images.map((image, index) => {
                return (
                  <div key={image.id || index} className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                      <img
                        src={getCachedImageSrc(image.url)}
                        alt={image.originalName || `이미지 ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        loading={isVisible ? 'eager' : 'lazy'}
                        decoding={isVisible ? 'sync' : 'async'}
                      />
                      {/* 이미지 로드 실패 시 플레이스홀더 */}
                      <div
                        className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 text-xs"
                        style={{ display: 'none' }}
                      >
                        <svg
                          className="w-4 h-4"
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 리뷰 내용 */}
        <div className="flex-1 mb-1">
          <div className="bg-gray-50/80 text-gray-700 text-xs sm:text-sm leading-snug p-2 sm:p-3 rounded-lg border border-gray-100 backdrop-blur-sm">
            <p
              className={`font-['NanumGothic'] overflow-hidden whitespace-pre-line ${
                review.images && review.images.length > 0
                  ? 'line-clamp-4 sm:line-clamp-5'
                  : 'line-clamp-6 sm:line-clamp-8'
              }`}
            >
              {review.content}
            </p>
          </div>
        </div>

        {/* 작성 날짜 - 하단 고정 */}
        <div className="flex justify-end mt-auto pt-1.5 sm:pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <svg
              className="w-2.5 h-2.5 sm:w-3 sm:h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 호버 시 미묘한 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
    </div>
  );
};

const ReviewDetailModal = ({ review, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !review) return null;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      );
    }
    return stars;
  };

  const getServiceTypeInKorean = (type) => {
    const serviceTypes = {
      computer: '컴퓨터',
      printer: '프린터',
      notebook: '노트북',
      as: 'AS서비스',
      other: '기타서비스',
    };
    return serviceTypes[type] || type;
  };

  // 이미지 로드 에러 처리
  const handleImageError = (e) => {
    e.target.src = '';
    e.target.style.display = 'none';
    // 에러가 발생한 이미지 다음으로 넘어가기
    const parent = e.target.closest('.image-container');
    if (parent) {
      const errorDiv = parent.querySelector('.image-error-placeholder');
      if (errorDiv) {
        errorDiv.style.display = 'flex';
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">리뷰 상세보기</h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* 모달 내용 - 스크롤 영역 */}
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* 사용자 정보 및 서비스 타입 */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                {review.userId && review.userId.name ? review.userId.name : '익명'} 님
              </h4>
              <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {getServiceTypeInKorean(review.serviceType)}
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">{renderStars(review.rating)}</div>
              <span className="text-base sm:text-lg font-bold text-gray-700">
                {review.rating}점
              </span>
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <h5 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
              리뷰 내용
            </h5>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line font-['NanumGothic']">
                {review.content}
              </p>
            </div>
          </div>

          {/* 이미지 갤러리 */}
          {review.images && review.images.length > 0 && (
            <div>
              <h5 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                첨부 이미지
              </h5>
              <div className="space-y-4">
                {/* 메인 이미지 */}
                <div className="relative flex items-center">
                  {/* 이전 버튼 */}
                  {review.images.length > 1 && (
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? review.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-10"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}

                  {/* 이미지 컨테이너 */}
                  <div className="relative bg-gray-100 rounded-xl overflow-hidden mx-auto image-container">
                    <img
                      src={review.images[currentImageIndex].url}
                      alt={
                        review.images[currentImageIndex].originalName ||
                        `이미지 ${currentImageIndex + 1}`
                      }
                      className="w-full h-128 object-contain"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    {/* 이미지 로드 실패 시 플레이스홀더 */}
                    <div className="image-error-placeholder absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 hidden">
                      <div className="text-center">
                        <svg
                          className="w-16 h-16 mx-auto mb-2"
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
                        <p className="text-sm">이미지를 불러올 수 없습니다</p>
                      </div>
                    </div>
                  </div>

                  {/* 다음 버튼 */}
                  {review.images.length > 1 && (
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === review.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-10"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>

                {/* 썸네일 */}
                {review.images.length > 1 && (
                  <div className="flex space-x-1.5 sm:space-x-2 overflow-x-auto pb-2">
                    {review.images.map((image, index) => (
                      <button
                        key={image.id || index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                          currentImageIndex === index
                            ? 'border-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.originalName || `썸네일 ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const errorDiv = e.target.nextElementSibling;
                            if (errorDiv) errorDiv.style.display = 'flex';
                          }}
                          loading="lazy"
                        />
                        {/* 썸네일 에러 플레이스홀더 */}
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 text-xs hidden">
                          <svg
                            className="w-4 h-4"
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
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 작성 날짜 */}
          <div className="text-right pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-1 text-xs sm:text-sm text-gray-500">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>작성일: {formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewCarousel = () => {
  // useReviewsStore 훅을 사용하여 리뷰 데이터 관리
  const { reviews, loading, error, fetchReviews } = useReviewsStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 이미지 캐싱을 위한 메모리 저장소
  const imageCache = useRef(new Map());
  const preloadedImages = useRef(new Set());
  const cacheStats = useRef({ hits: 0, misses: 0 });

  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  // 이미지 프리로딩 함수
  const preloadImage = useCallback((imageUrl) => {
    if (!imageUrl || preloadedImages.current.has(imageUrl)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(imageUrl, img);
        preloadedImages.current.add(imageUrl);
        if (process.env.NODE_ENV === 'development') {
          console.log(`📷 이미지 캐시에 저장: ${imageUrl.substring(0, 50)}...`);
        }
        resolve(img);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }, []);

  // 이전/다음 카드 인덱스 계산
  const getPrevNextIndices = useCallback(() => {
    if (!reviews.length) return { prevIndices: [], nextIndices: [] };

    const prevIndices = [];
    const nextIndices = [];

    // 이전 카드들 계산
    for (let i = 0; i < cardsPerView; i++) {
      const prevIndex = currentIndex - cardsPerView + i;
      const normalizedPrevIndex = prevIndex < 0 ? reviews.length + prevIndex : prevIndex;
      if (normalizedPrevIndex >= 0 && normalizedPrevIndex < reviews.length) {
        prevIndices.push(normalizedPrevIndex);
      }
    }

    // 다음 카드들 계산
    for (let i = 0; i < cardsPerView; i++) {
      const nextIndex = (currentIndex + cardsPerView + i) % reviews.length;
      nextIndices.push(nextIndex);
    }

    return { prevIndices, nextIndices };
  }, [currentIndex, cardsPerView, reviews.length]);

  // 선택적 이미지 프리로딩
  const preloadAdjacentImages = useCallback(async () => {
    if (!reviews.length) return;

    const { prevIndices, nextIndices } = getPrevNextIndices();
    const indicesToPreload = [...prevIndices, ...nextIndices];

    const preloadPromises = [];

    indicesToPreload.forEach((index) => {
      const review = reviews[index];
      if (review && review.images && review.images.length > 0) {
        review.images.forEach((image) => {
          if (image.url) {
            preloadPromises.push(preloadImage(image.url));
          }
        });
      }
    });

    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('일부 이미지 프리로딩에 실패했습니다:', error);
    }
  }, [reviews, getPrevNextIndices, preloadImage]);

  // 화면 크기에 따른 카드 수 계산
  const calculateCardsPerView = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1280) return 5; // xl - 5개 카드
    if (width >= 1024) return 4; // lg - 4개 카드
    if (width >= 768) return 3; // md - 3개 카드
    if (width >= 570) return 2; // 570px 이상 - 2개 카드
    return 1; // 570px 미만 - 1개 카드
  }, []);

  // 현재 보여줄 리뷰들만 계산 (가상화)
  const getVisibleReviews = useCallback(() => {
    if (!reviews.length) return [];

    const visibleReviews = [];
    for (let i = 0; i < cardsPerView; i++) {
      const index = (currentIndex + i) % reviews.length;
      visibleReviews.push(reviews[index]);
    }
    return visibleReviews;
  }, [reviews, currentIndex, cardsPerView]);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(calculateCardsPerView());
    };

    handleResize(); // 초기 설정
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCardsPerView]);

  // 컴포넌트 마운트 시 리뷰 데이터 가져오기
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 현재 보이는 카드의 이미지 즉시 로딩 및 인접 카드 프리로딩
  useEffect(() => {
    if (!reviews.length) return;

    // 현재 보이는 카드의 이미지 즉시 로딩
    const currentReviews = getVisibleReviews();
    const currentImagePromises = [];

    currentReviews.forEach((review) => {
      if (review && review.images && review.images.length > 0) {
        review.images.forEach((image) => {
          if (image.url) {
            currentImagePromises.push(preloadImage(image.url));
          }
        });
      }
    });

    // 현재 이미지 로딩 후 인접 카드 프리로딩
    Promise.allSettled(currentImagePromises).then(() => {
      // 약간의 지연 후 인접 이미지 프리로딩 (현재 이미지 우선)
      setTimeout(() => {
        preloadAdjacentImages();
      }, 100);
    });
  }, [currentIndex, reviews, cardsPerView, preloadImage, preloadAdjacentImages, getVisibleReviews]);

  // 수동 네비게이션
  const goToPrevious = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex - cardsPerView;
        return newIndex < 0 ? reviews.length + newIndex : newIndex;
      });
      setTimeout(() => setIsAnimating(false), 150);
    }, 150);
  };

  const goToNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        return (prevIndex + cardsPerView) % reviews.length;
      });
      setTimeout(() => setIsAnimating(false), 150);
    }, 150);
  };

  const visibleReviews = getVisibleReviews();

  if (loading) {
    return (
      <div className="bg-gradient-to-bl from-sky-50 to-blue-200 py-12 text-center">
        <p className="text-gray-500">리뷰를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-blue-200 py-12 text-center">
        <p className="text-red-500">리뷰를 불러오는데 실패했습니다: {error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-blue-200 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">
              고객님들의 생생한 후기
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              웰컴시스템을 경험하신 고객님들의 솔직한 이야기를 만나보세요.
            </p>
          </div>
        </div>
        <p className="text-gray-500">아직 등록된 리뷰가 없습니다...</p>
      </div>
    );
  }

  return (
    <section className="py-6 sm:py-10 bg-gradient-to-bl from-sky-50 to-blue-200 overflow-hidden font-['NanumGothic']">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-2">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">
            고객님들의 생생한 후기
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            웰컴시스템을 경험하신 고객님들의 솔직한 이야기를 만나보세요.
          </p>
        </div>

        {/* 리뷰 카드 컨테이너 */}
        <div className="relative max-w-screen-2xl mx-auto">
          {/* 네비게이션 버튼 (리뷰가 많을 때만 표시) */}
          {reviews.length > cardsPerView && (
            <>
              <button
                onClick={goToPrevious}
                disabled={isAnimating}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 sm:p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                aria-label="이전 리뷰"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
              <button
                onClick={goToNext}
                disabled={isAnimating}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 sm:p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                aria-label="다음 리뷰"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
            </>
          )}

          {/* 리뷰 카드 그리드 */}
          <div className="mx-6 sm:mx-8 lg:mx-16">
            <div
              className={`grid gap-3 sm:gap-4 lg:gap-6 transition-all duration-300 ease-in-out ${
                cardsPerView === 1
                  ? 'grid-cols-1'
                  : cardsPerView === 2
                    ? 'grid-cols-2'
                    : cardsPerView === 3
                      ? 'grid-cols-2 md:grid-cols-3'
                      : cardsPerView === 4
                        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                        : cardsPerView === 5
                          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                          : 'grid-cols-1'
              } ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
            >
              {visibleReviews.map((review) => (
                <div
                  key={`${review._id}-${currentIndex}`}
                  className="h-auto min-h-[180px] sm:min-h-[200px]"
                >
                  <ReviewCard
                    review={review}
                    onClick={handleReviewClick}
                    isVisible={true}
                    imageCache={imageCache}
                    cacheStats={cacheStats}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedReview && (
        <ReviewDetailModal review={selectedReview} isOpen={isModalOpen} onClose={closeModal} />
      )}

      <style jsx global>{`
        /* 스크롤바 스타일 */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #a0aec0 #f7fafc;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f7fafc;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #a0aec0;
          border-radius: 20px;
          border: 3px solid #f7fafc;
        }

        /* 스크롤바 숨기기 */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Line clamp 스타일 */
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .line-clamp-5 {
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .line-clamp-6 {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .line-clamp-8 {
          display: -webkit-box;
          -webkit-line-clamp: 8;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </section>
  );
};

export default ReviewCarousel;
