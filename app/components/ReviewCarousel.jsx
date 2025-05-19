'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { formatDate } from '@/utils/dateFormat';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
    <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-5 py-3 mx-2 border border-blue-100 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-bold text-slate-800 text-lg">
            {review.userId && review.userId.name ? review.userId.name : '익명'}
            <span className="text-gray-500 text-xs"> 님</span>
          </p>
          <p className="text-sm text-blue-500 font-medium">
            {getServiceTypeInKorean(review.serviceType)}
          </p>
        </div>
        <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full">
          {renderStars(review.rating)}
          <span className="ml-1 text-blue-700 font-semibold text-sm">{review.rating}</span>
        </div>
      </div>

      <div className="relative">
        {/* <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-sky-400 rounded-full"></div> */}
        <div className="pl-4 bg-gray-50 text-gray-700 text-sm leading-relaxed h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100 font-['NanumGothic'] whitespace-pre-line">
          {review.content}
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <div className="text-xs text-gray-400">{formatDate(review.createdAt)}</div>
      </div>
    </div>
  );
};

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 무한 슬라이드를 위해 리뷰 목록을 3번 복제하여 연결
  const tripledReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className="py-16 bg-gradient-to-bl from-sky-50 to-blue-200 overflow-hidden font-['NanumGothic']">
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
      <div className="relative overflow-hidden">
        <div className="flex animate-infinite-scroll group-hover:animation-pause">
          {tripledReviews.map((review, index) => (
            <ReviewCard key={`${review._id}-${index}`} review={review} />
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes infinite-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-${reviews.length * (320 + 24)}px * 2));
          }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 110s linear infinite;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        /* For md:w-96, card width is 384px. (384 + 24) */
        @media (min-width: 768px) {
          @keyframes infinite-scroll-md {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-${reviews.length * (384 + 24)}px * 2));
            }
          }
          .animate-infinite-scroll {
            animation-name: infinite-scroll-md;
          }
        }
        .group-hover\\:animation-pause:hover .animate-infinite-scroll,
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }

        /* 스크롤바 스타일 (tailwind.config.js에 plugin 추가 필요) */
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
      `}</style>
    </section>
  );
};

export default ReviewCarousel;
