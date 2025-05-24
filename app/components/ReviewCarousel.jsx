'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/utils/dateFormat';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
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

  return (
    <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 w-full h-full min-h-[260px]">
      {/* 카드 상단 테두리 라인 */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

      <div className="p-4 flex flex-col h-full">
        {/* 사용자 이름 */}
        <div className="mb-1">
          <p className="font-bold text-gray-800 text-base leading-tight">
            {review.userId && review.userId.name ? review.userId.name : '익명'} 님
          </p>
        </div>

        {/* 서비스 타입과 별점 */}
        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {getServiceTypeInKorean(review.serviceType)}
          </span>
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-0.5">{renderStars(review.rating)}</div>
            <span className="ml-1.5 text-xs font-semibold text-gray-700">{review.rating}점</span>
          </div>
        </div>

        {/* 이미지 섹션 */}
        {review.images && review.images.length > 0 && (
          <div className="mb-1">
            <div className="flex space-x-1.5 overflow-x-auto scrollbar-hide pb-1">
              {review.images.map((image, index) => (
                <div key={image.id || index} className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <img
                      src={image.url}
                      alt={image.originalName || `이미지 ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 리뷰 내용 */}
        <div className="flex-1 mb-1">
          <div className="bg-gray-50/80 text-gray-700 text-sm leading-snug p-3 rounded-lg border border-gray-100 backdrop-blur-sm">
            <p
              className={`font-['NanumGothic'] overflow-hidden whitespace-pre-line ${
                review.images && review.images.length > 0 ? 'line-clamp-5' : 'line-clamp-8'
              }`}
            >
              {review.content}
            </p>
          </div>
        </div>

        {/* 작성 날짜 - 하단 고정 */}
        <div className="flex justify-end mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 호버 시 미묘한 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
    </div>
  );
};

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // 화면 크기에 따른 카드 수 계산
  const calculateCardsPerView = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1280) return 5; // xl - 5개 카드
    if (width >= 1024) return 4; // lg - 4개 카드
    if (width >= 768) return 3; // md - 3개 카드
    if (width >= 570) return 2; // 570px 이상 - 2개 카드
    return 1; // 570px 미만 - 1개 카드
  }, []);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(calculateCardsPerView());
    };

    handleResize(); // 초기 설정
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCardsPerView]);

  // 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reviews/active');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReviews(data);
      } catch (e) {
        console.error('Failed to fetch reviews:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // 자동 슬라이드 기능
  useEffect(() => {
    if (reviews.length <= cardsPerView) return; // 카드가 화면에 모두 들어가면 슬라이드 불필요

    const interval = setInterval(() => {
      setIsAnimating(true);
      setCurrentIndex((prevIndex) => {
        return (prevIndex + cardsPerView) % reviews.length;
      });

      // 애니메이션 상태 리셋
      setTimeout(() => setIsAnimating(false), 500);
    }, 10000);

    return () => clearInterval(interval);
  }, [reviews.length, cardsPerView]);

  // 수동 네비게이션
  const goToPrevious = () => {
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - cardsPerView;
      return newIndex < 0 ? reviews.length + newIndex : newIndex;
    });
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToNext = () => {
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      return (prevIndex + cardsPerView) % reviews.length;
    });
    setTimeout(() => setIsAnimating(false), 500);
  };

  // 현재 보여줄 리뷰들 - 순환 배열로 처리
  const getVisibleReviews = () => {
    const visibleReviews = [];
    for (let i = 0; i < cardsPerView; i++) {
      const index = (currentIndex + i) % reviews.length;
      visibleReviews.push(reviews[index]);
    }
    return visibleReviews;
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
        <p className="text-gray-500">아직 등록된 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <section className="py-10 bg-gradient-to-bl from-sky-50 to-blue-200 overflow-hidden font-['NanumGothic']">
      <div className="max-w-full mx-auto px-4 sm:px-1 lg:px-2">
        <div className="text-center mb-5">
          <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">
            고객님들의 생생한 후기
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                aria-label="이전 리뷰"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={goToNext}
                disabled={isAnimating}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                aria-label="다음 리뷰"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}

          {/* 리뷰 카드 그리드 */}
          <div className="mx-8 sm:mx-12 lg:mx-16">
            <div
              className={`grid gap-4 sm:gap-6 transition-all duration-500 ease-in-out ${
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
              } ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}
            >
              {visibleReviews.map((review) => (
                <div key={`${review._id}-${currentIndex}`} className="h-auto min-h-[200px]">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
        .line-clamp-5 {
          display: -webkit-box;
          -webkit-line-clamp: 5;
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
