'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiStar,
  FiEdit,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { MdDeleteForever } from 'react-icons/md';
import ReviewEditModal from './ReviewEditModal';

// 개별 리뷰 카드 컴포넌트
const ReviewCard = ({ review, onEdit, onDelete, onViewImages }) => {
  const getServiceTypeText = (type) => {
    switch (type) {
      case 'computer':
        return '컴퓨터';
      case 'printer':
        return '프린터';
      case 'notebook':
        return '노트북';
      case 'as':
        return 'AS 서비스';
      case 'other':
        return '기타 서비스';
      default:
        return type;
    }
  };

  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md mr-2">
            {getServiceTypeText(review.serviceType)}
          </span>
        </div>
        <span className="text-xs text-gray-500">{formatReviewDate(review.createdAt)}</span>
      </div>

      <div className="flex items-center mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${
              star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{review.rating}점</span>
      </div>

      <p className="text-gray-700 whitespace-pre-line text-sm mb-3 line-clamp-3">
        {review.content}
      </p>

      {/* 이미지 정보 및 액션 버튼 */}
      <div className="flex items-center justify-between mb-3">
        {/* 왼쪽: 이미지 보기 버튼 (이미지가 있을 때만) */}
        <div className="flex items-center gap-2">
          {review.imageCount > 0 && (
            <button
              onClick={() => onViewImages(review.id)}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium border border-indigo-200"
            >
              <FiEye size={14} />
              <span>이미지 {review.imageCount}장 보기</span>
            </button>
          )}
          {review.imageCount === 0 && (
            <div className="flex items-center text-xs text-gray-400">
              <FiImage className="mr-1" size={12} />
              <span>이미지 없음</span>
            </div>
          )}
        </div>

        {/* 오른쪽: 수정/삭제 버튼 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(review)}
            className="py-1 px-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs flex items-center gap-1"
          >
            <FiEdit size={12} /> 수정하기
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="py-1 px-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs flex items-center"
          >
            <MdDeleteForever size={12} /> 삭제
          </button>
        </div>
      </div>
    </div>
  );
};

// 이미지 뷰어 컴포넌트
const ImageViewer = ({ isOpen, onClose, reviewId, userId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen && reviewId) {
      loadImages();
    }
  }, [isOpen, reviewId]);

  // 키보드 네비게이션
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/user/${userId}/${reviewId}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-semibold">리뷰 이미지</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">이미지를 불러오는 중...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>이미지가 없습니다.</p>
            </div>
          ) : (
            <div>
              {/* 현재 이미지 */}
              <div className="mb-6">
                <img
                  src={images[currentIndex]?.url}
                  alt={images[currentIndex]?.originalName}
                  className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>

              {/* 이미지 네비게이션 */}
              {images.length > 1 && (
                <div className="flex justify-center items-center space-x-6 mb-6">
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                    }
                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shadow-md"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <div className="text-center">
                    <span className="text-lg font-medium text-gray-700">
                      {currentIndex + 1} / {images.length}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      {images[currentIndex]?.originalName}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                    }
                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shadow-md"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              )}

              {/* 썸네일 */}
              {images.length > 1 && (
                <div className="flex justify-center space-x-3 mt-6 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        index === currentIndex
                          ? 'border-indigo-500 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* 키보드 단축키 안내 */}
              {images.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-center items-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">←</kbd>
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">→</kbd>
                      <span>이미지 전환</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd>
                      <span>닫기</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 메인 리뷰 목록 컴포넌트
const OptimizedReviewList = ({ userId, onDelete, showToast }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const limit = 5; // 페이지당 5개씩

  // 리뷰 목록 로드
  const loadReviews = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reviews/user/${userId}?page=${page}&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
          setPagination(data.pagination || {});
        } else {
          showToast('리뷰 목록을 불러오는데 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('리뷰 로딩 실패:', error);
        showToast('리뷰 목록을 불러오는데 실패했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    },
    [userId, limit, showToast]
  );

  // 초기 로드
  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      loadReviews(newPage);
    }
  };

  // 이미지 뷰어 열기
  const handleViewImages = (reviewId) => {
    setSelectedReviewId(reviewId);
    setImageViewerOpen(true);
  };

  // 리뷰 편집 열기
  const handleEdit = (review) => {
    setSelectedReview(review);
    setEditModalOpen(true);
  };

  // 리뷰 편집 저장 후 목록 새로고침
  const handleEditSave = () => {
    loadReviews(currentPage);
  };

  // 리뷰 삭제 후 목록 새로고침
  const handleDelete = async (reviewId) => {
    const success = await onDelete(reviewId);
    if (success) {
      // 현재 페이지에 리뷰가 1개뿐이고 1페이지가 아니라면 이전 페이지로
      if (reviews.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        loadReviews(newPage);
      } else {
        loadReviews(currentPage);
      }
    }
  };

  if (loading && reviews.length === 0) {
    return <div className="py-6 text-center text-gray-500">리뷰 목록을 불러오는 중...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="text-gray-400 mb-2">
          <FiStar size={40} className="mx-auto mb-2" />
        </div>
        <p className="text-gray-600">작성한 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewImages={handleViewImages}
          />
        ))}
      </div>

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      )}

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <FiChevronLeft size={16} />
          </button>

          <div className="flex space-x-1">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 페이지 정보 */}
      {pagination.totalCount > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          총 {pagination.totalCount}개 리뷰 중 {(currentPage - 1) * limit + 1} -{' '}
          {Math.min(currentPage * limit, pagination.totalCount)}번째 표시
        </div>
      )}

      {/* 이미지 뷰어 */}
      <ImageViewer
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        reviewId={selectedReviewId}
        userId={userId}
      />

      {/* 리뷰 편집 모달 */}
      <ReviewEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        review={selectedReview}
        onSave={handleEditSave}
        showToast={showToast}
        userId={userId}
      />

      <style jsx global>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export default OptimizedReviewList;
