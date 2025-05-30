'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiStar, FiSend, FiAlertTriangle, FiX } from 'react-icons/fi';

import ReviewUploadProgress from '@/app/components/ReviewUploadProgress';
import OptimizedReviewList from '@/app/components/OptimizedReviewList';

const ReviewContent = ({ userData, userId }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceType, setServiceType] = useState('');

  // OptimizedReviewList의 새로고침 함수에 접근하기 위한 ref
  const reviewListRefreshRef = useRef(null);

  // 리뷰 삭제 확인 모달 상태
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // 이미지 업로드 관련 상태
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageError, setImageError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);

  // 토스트 상태를 하나의 객체로 관리
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: '', // 'success' 또는 'error'
  });

  // 이미지 파일 검증 함수
  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('JPG, PNG 파일만 업로드 가능합니다.');
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('이미지 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.');
    }

    return true;
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageError('');

    if (files.length === 0) return;

    // 최대 5장 체크
    if (selectedImages.length + files.length > 5) {
      setImageError('이미지는 최대 5장까지만 업로드 가능합니다.');
      return;
    }

    try {
      // 각 파일 검증
      files.forEach(validateImageFile);

      // 새로운 이미지들 추가
      const newImages = [...selectedImages, ...files];
      setSelectedImages(newImages);

      // 미리보기 URL 생성
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    } catch (error) {
      setImageError(error.message);
    }
  };

  // 이미지 제거 핸들러
  const handleImageRemove = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);

    // 기존 URL 해제
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
    setImageError('');
  };

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // 토스트 메시지 표시 함수 (useCallback으로 메모이제이션)
  const showToast = useCallback((message, type = 'success') => {
    // 이전 타이머가 있다면 제거
    setToast((prevToast) => {
      if (prevToast.timerId) {
        clearTimeout(prevToast.timerId);
      }

      // 토스트 표시
      return {
        visible: true,
        message,
        type,
        // 타이머 ID 저장
        timerId: setTimeout(() => {
          // 토스트 숨김
          setToast((prev) => ({
            ...prev,
            visible: false,
            // 타이머 ID만 유지
            timerId: setTimeout(() => {
              // 토스트 상태 완전 초기화
              setToast({
                visible: false,
                message: '',
                type: '',
                timerId: null,
              });
            }, 300),
          }));
        }, 2000),
      };
    });
  }, []); // 의존성 없음 - 함수가 변경되지 않음

  // 컴포넌트가 언마운트될 때 타이머 정리
  useEffect(() => {
    return () => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
    };
  }, [toast.timerId]);

  // 삭제 버튼 클릭 시 호출되는 함수 (모달 표시)
  const handleDeleteReview = async (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirmModal(true);
    return false; // 일단 false 반환 (모달에서 실제 삭제 처리)
  };

  // 실제 리뷰 삭제 함수
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      // 리뷰 삭제 API 호출 (isDeleted를 true로 설정)
      const response = await fetch(`/api/reviews/${reviewToDelete}/delete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '리뷰 삭제에 실패했습니다.');
      }

      // 성공 메시지 표시
      showToast('리뷰가 성공적으로 삭제되었습니다.', 'success');

      // 모달 닫기
      setShowDeleteConfirmModal(false);
      setReviewToDelete(null);

      // 리뷰 목록 새로고침
      if (reviewListRefreshRef.current) {
        reviewListRefreshRef.current();
      }
    } catch (err) {
      showToast(err.message, 'error');
      setShowDeleteConfirmModal(false);
      setReviewToDelete(null);
    }
  };

  // 삭제 취소 함수
  const cancelDeleteReview = () => {
    setShowDeleteConfirmModal(false);
    setReviewToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceType) {
      showToast('서비스 유형을 선택해주세요.', 'error');
      return;
    }

    if (rating === 0) {
      showToast('별점을 선택해주세요.', 'error');
      return;
    }

    if (reviewText.trim().length < 10) {
      showToast('리뷰는 최소 10자 이상 작성해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImages = [];

      // 이미지가 있는 경우 클라이언트에서 직접 업로드
      if (selectedImages.length > 0) {
        const { uploadMultipleReviewImages } = await import(
          '@/lib/client-cloudinary-upload-review'
        );

        // 임시 리뷰 ID 생성 (파일명에 사용)
        const tempId = Date.now().toString();

        uploadedImages = await uploadMultipleReviewImages(
          selectedImages,
          userId,
          tempId,
          (progress) => {
            setUploadProgress(progress);
          }
        );
      }

      // 업로드 진행률 초기화
      setUploadProgress(null);

      // 리뷰 API 호출 (JSON 방식)
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType,
          rating,
          content: reviewText,
          images: uploadedImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '리뷰 등록에 실패했습니다.');
      }

      // 성공 메시지 표시
      showToast('리뷰가 성공적으로 등록되었습니다.', 'success');

      // 폼 초기화
      setReviewText('');
      setRating(0);
      setServiceType('');
      setHoveredRating(0);
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setImageError('');
      setUploadProgress(null);

      // 파일 입력 필드 초기화
      const fileInput = document.getElementById('imageInput');
      if (fileInput) {
        fileInput.value = '';
      }

      // 1초 후 리뷰 목록 새로고침
      setTimeout(() => {
        if (reviewListRefreshRef.current) {
          reviewListRefreshRef.current();
        }
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 파일 크기 포맷 함수
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 토스트 메시지 */}
      {toast.visible && toast.message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 
          ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
        >
          <div
            className={`py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium
            ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            {toast.type === 'error' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6 relative pb-2 sm:pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 sm:after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
        리뷰 작성
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 mb-10">
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
            서비스 유형
          </label>
          <select
            id="serviceType"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="" disabled>
              서비스 유형을 선택하세요
            </option>
            <option value="computer">컴퓨터</option>
            <option value="printer">프린터</option>
            <option value="notebook">노트북</option>
            <option value="as">AS 서비스</option>
            <option value="other">기타 서비스</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">별점</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl sm:text-3xl focus:outline-none"
              >
                <FiStar
                  className={`${
                    (hoveredRating ? hoveredRating >= star : rating >= star)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating > 0 ? `${rating}점` : '별점을 선택해주세요'}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-1">
            리뷰 내용
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
            placeholder="서비스에 대한 경험을 자세히 알려주세요"
            rows={5}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            최소 10자 이상 작성해주세요. 현재 {reviewText.length}자
          </p>
        </div>

        {/* 이미지 업로드 섹션 */}
        <div>
          <label htmlFor="imageInput" className="block text-sm font-medium text-gray-700 mb-1">
            이미지 업로드 (최대 5장, 각 10MB 이하)
          </label>
          <div className="relative">
            <input
              type="file"
              id="imageInput"
              multiple
              accept="image/jpeg,image/png,.jpg,.png"
              onChange={handleImageSelect}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              disabled={isSubmitting}
            />
            {selectedImages.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {selectedImages.length}/5
                </span>
              </div>
            )}
          </div>
          <div className="mt-1 space-y-1">
            <p className="text-xs text-gray-500">JPG, PNG 파일만 가능합니다.</p>
            {selectedImages.length >= 5 && (
              <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠️ 최대 5장까지만 업로드할 수 있습니다.
              </p>
            )}
          </div>
          {imageError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">{imageError}</p>
            </div>
          )}
        </div>

        {/* 이미지 미리보기 */}
        {selectedImages.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                선택된 이미지 ({selectedImages.length}/5)
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSelectedImages([]);
                  setImagePreviewUrls([]);
                  setImageError('');
                  const fileInput = document.getElementById('imageInput');
                  if (fileInput) fileInput.value = '';
                }}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
                disabled={isSubmitting}
              >
                전체 삭제
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                    <img
                      src={imagePreviewUrls[index]}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* 로딩 오버레이 */}
                    {isSubmitting && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 active:bg-red-700 transition-colors shadow-lg border-2 border-white"
                    disabled={isSubmitting}
                    title="이미지 삭제"
                  >
                    <FiX />
                  </button>
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600 truncate font-medium" title={image.name}>
                      {image.name}
                    </div>
                    <div className="text-xs text-gray-500">{formatFileSize(image.size)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>팁:</strong> 이미지를 터치하여 삭제할 수 있습니다. 업로드 중에는 수정할
                수 없습니다.
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">진행 상황:</span>
              <span className="font-medium text-gray-800">
                {[
                  serviceType ? '✅' : '❌',
                  rating > 0 ? '✅' : '❌',
                  reviewText.trim().length >= 10 ? '✅' : '❌',
                ].join(' ')}{' '}
                ({[serviceType, rating > 0, reviewText.trim().length >= 10].filter(Boolean).length}
                /3)
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <div className={serviceType ? 'text-green-600' : 'text-gray-500'}>
                • 서비스 유형 선택 {serviceType ? '✅' : ''}
              </div>
              <div className={rating > 0 ? 'text-green-600' : 'text-gray-500'}>
                • 별점 선택 {rating > 0 ? '✅' : ''}
              </div>
              <div className={reviewText.trim().length >= 10 ? 'text-green-600' : 'text-gray-500'}>
                • 리뷰 내용 작성 (최소 10자){' '}
                {reviewText.trim().length >= 10 ? '✅' : `(${reviewText.length}/10)`}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !serviceType || rating === 0 || reviewText.trim().length < 10}
            className={`w-full py-4 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 text-base
              ${
                isSubmitting || !serviceType || rating === 0 || reviewText.trim().length < 10
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                리뷰 등록 중...
              </>
            ) : uploadProgress ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                이미지 업로드 중...
              </>
            ) : (
              <>
                <FiSend size={18} />
                리뷰 등록하기
              </>
            )}
          </button>

          {(isSubmitting || uploadProgress) && (
            <p className="mt-2 text-xs text-center text-gray-600">
              완료될 때까지 화면을 끄지 마시고 잠시만 기다려주세요.
            </p>
          )}
        </div>
      </form>

      {/* 내가 작성한 리뷰 목록 */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          내가 작성한 리뷰
        </h3>

        <OptimizedReviewList
          userId={userId}
          onDelete={handleDeleteReview}
          showToast={showToast}
          onRefreshRef={reviewListRefreshRef}
        />
      </div>

      {/* 업로드 진행률 모달 */}
      <ReviewUploadProgress progress={uploadProgress} />

      {/* 리뷰 삭제 확인 모달 */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">리뷰 삭제 확인</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                <strong>정말로 이 리뷰를 삭제하시겠습니까?</strong>
              </p>
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <p className="text-sm text-red-700">
                  ⚠️ <strong>주의:</strong> 삭제된 리뷰는 복구할 수 없습니다.
                </p>
                <p className="text-sm text-red-600 mt-1">• 리뷰 내용과 이미지가 모두 삭제됩니다</p>
                <p className="text-sm text-red-600">• 이 작업은 되돌릴 수 없습니다</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteReview}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteReview}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewContent;
