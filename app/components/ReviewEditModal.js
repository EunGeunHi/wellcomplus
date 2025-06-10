'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import ReviewUploadProgress from './ReviewUploadProgress';

const ReviewEditModal = ({ isOpen, onClose, review, onSave, showToast, userId }) => {
  const [editForm, setEditForm] = useState({
    content: '',
    rating: 0,
    serviceType: '',
    existingImages: [],
    newImages: [],
    newImagePreviewUrls: [],
    imagesToDelete: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  useEffect(() => {
    if (isOpen && review) {
      // 먼저 기본 정보 설정
      setEditForm({
        content: review.content || '',
        rating: review.rating || 0,
        serviceType: review.serviceType || '',
        existingImages: [],
        newImages: [],
        newImagePreviewUrls: [],
        imagesToDelete: [],
      });

      // 이미지 정보 별도 로드
      loadExistingImages(review.id);
    }
  }, [isOpen, review]);

  const loadExistingImages = async (reviewId) => {
    try {
      const response = await fetch(`/api/reviews/user/${userId}/${reviewId}/images`);
      if (response.ok) {
        const data = await response.json();
        setEditForm((prev) => ({
          ...prev,
          existingImages: data.images || [],
        }));
      } else {
        console.error('이미지 로딩 실패: API 응답 오류');
        showToast('기존 이미지를 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      showToast('기존 이미지를 불러오는데 실패했습니다.', 'error');
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

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (newRating) => {
    setEditForm((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleExistingImageRemove = (imageId) => {
    setEditForm((prev) => ({
      ...prev,
      imagesToDelete: [...prev.imagesToDelete, imageId],
    }));
    showToast('이미지가 삭제 예정 목록에 추가되었습니다.', 'success');
  };

  const handleExistingImageRestore = (imageId) => {
    setEditForm((prev) => ({
      ...prev,
      imagesToDelete: prev.imagesToDelete.filter((id) => id !== imageId),
    }));
    showToast('이미지가 복원되었습니다.', 'success');
  };

  // 이미지 파일 검증 함수
  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('JPG, PNG, WEBP 파일만 업로드 가능합니다.');
    }

    return true;
  };

  const handleNewImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentExistingCount = editForm.existingImages.length - editForm.imagesToDelete.length;
    const currentNewCount = editForm.newImages.length;
    const totalAfterAdd = currentExistingCount + currentNewCount + files.length;

    if (totalAfterAdd > 5) {
      showToast('이미지는 최대 5장까지만 업로드 가능합니다.', 'error');
      return;
    }

    try {
      // 각 파일 검증
      files.forEach(validateImageFile);

      const newImages = [...editForm.newImages, ...files];
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      const allNewPreviewUrls = [...editForm.newImagePreviewUrls, ...newPreviewUrls];

      setEditForm((prev) => ({
        ...prev,
        newImages: newImages,
        newImagePreviewUrls: allNewPreviewUrls,
      }));

      showToast(`${files.length}개의 이미지가 추가되었습니다.`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }

    // 파일 입력 필드 초기화
    e.target.value = '';
  };

  const handleNewImageRemove = (index) => {
    const newImages = editForm.newImages.filter((_, i) => i !== index);
    const newPreviewUrls = editForm.newImagePreviewUrls.filter((_, i) => i !== index);

    // 기존 URL 해제
    URL.revokeObjectURL(editForm.newImagePreviewUrls[index]);

    setEditForm((prev) => ({
      ...prev,
      newImages: newImages,
      newImagePreviewUrls: newPreviewUrls,
    }));

    showToast('새 이미지가 제거되었습니다.', 'success');
  };

  const handleSave = async () => {
    if (editForm.content.trim().length < 10) {
      showToast('리뷰는 최소 10자 이상 작성해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let allImages = [];

      // 기존 이미지 중 삭제되지 않은 것들 추가 (스키마 필수 필드 보장)
      const remainingExistingImages = editForm.existingImages
        .filter((img) => !editForm.imagesToDelete.includes(img.id))
        .map((img) => ({
          url: img.url,
          filename: img.filename || `legacy_${img.id}`, // fallback for legacy data
          originalName: img.originalName,
          mimeType: img.mimeType,
          size: img.size,
          cloudinaryId: img.cloudinaryId || img.blobId || img.id, // fallback for legacy data
          uploadedAt: img.uploadedAt || new Date(),
        }));
      allImages = [...remainingExistingImages];

      // 새 이미지가 있는 경우 클라이언트에서 직접 업로드
      if (editForm.newImages.length > 0) {
        const { uploadMultipleReviewImages } = await import(
          '@/lib/client-cloudinary-upload-review'
        );

        // 임시 리뷰 ID 생성 (파일명에 사용)
        const tempId = Date.now().toString();

        const uploadedImages = await uploadMultipleReviewImages(
          editForm.newImages,
          userId,
          tempId,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        allImages = [...allImages, ...uploadedImages];
      }

      // 업로드 진행률 초기화
      setUploadProgress(null);

      // 디버깅: 전송할 이미지 데이터 확인
      console.log('전송할 이미지 데이터:', allImages);

      // 리뷰 수정 API 호출 (JSON 방식)
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editForm.content,
          rating: editForm.rating,
          serviceType: editForm.serviceType,
          images: allImages,
          imagesToDelete: editForm.imagesToDelete, // 삭제할 기존 이미지 ID 배열 추가
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '리뷰 수정에 실패했습니다.');
      }

      showToast('리뷰가 성공적으로 수정되었습니다.', 'success');

      // 새 이미지 미리보기 URL들 정리
      editForm.newImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

      onSave(); // 상위 컴포넌트에 저장 완료 알림
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // 새 이미지 미리보기 URL들 정리
    editForm.newImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    onClose();
  };

  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4 pb-20 md:pb-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-80px)] flex flex-col shadow-xl">
        {/* 헤더 - 고정 */}
        <div className="p-3 md:p-4 border-b flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">리뷰 수정</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4" style={{ minHeight: 0 }}>
          <div className="space-y-3 md:space-y-4">
            {/* 서비스 타입 */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
                서비스 타입
              </label>
              <select
                name="serviceType"
                value={editForm.serviceType}
                onChange={handleEditFormChange}
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm md:text-base"
              >
                <option value="computer">컴퓨터</option>
                <option value="printer">프린터</option>
                <option value="notebook">노트북</option>
                <option value="as">AS 서비스</option>
                <option value="other">기타 서비스</option>
              </select>
            </div>

            {/* 별점 */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
                별점
              </label>
              <div className="flex items-center gap-1 p-2 md:p-3 bg-gray-50 rounded-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="text-xl md:text-2xl focus:outline-none transition-all duration-200 hover:scale-110"
                  >
                    <FiStar
                      className={`${
                        editForm.rating >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      } transition-colors`}
                    />
                  </button>
                ))}
                <span className="ml-2 md:ml-3 text-xs md:text-sm text-gray-600">
                  {editForm.rating > 0 ? `${editForm.rating}점` : '별점을 선택해주세요'}
                </span>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2">
                리뷰 내용
              </label>
              <textarea
                name="content"
                value={editForm.content}
                onChange={handleEditFormChange}
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] md:min-h-[120px] transition-colors resize-none text-sm md:text-base"
                rows={4}
                placeholder="리뷰 내용을 입력하세요"
              />
              <div className="mt-1 md:mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">최소 10자 이상 작성해주세요</p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    editForm.content.length >= 10
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {editForm.content.length}자
                </span>
              </div>
            </div>

            {/* 이미지 관리 */}
            <div className="space-y-3 md:space-y-4">
              {/* 기존 이미지들 */}
              {editForm.existingImages && editForm.existingImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h5 className="text-xs md:text-sm font-medium text-gray-900">
                      기존 이미지 ({editForm.existingImages.length - editForm.imagesToDelete.length}
                      /{editForm.existingImages.length})
                    </h5>
                    <div className="flex items-center gap-2">
                      {editForm.imagesToDelete.length > 0 && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          {editForm.imagesToDelete.length}개 삭제 예정
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 md:gap-3">
                    {editForm.existingImages.map((image, index) => (
                      <div key={image.id || index} className="relative">
                        <div
                          className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border transition-all ${
                            editForm.imagesToDelete.includes(image.id)
                              ? 'opacity-50 grayscale border-red-300'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.originalName || `이미지 ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* 삭제 상태 오버레이 */}
                          {editForm.imagesToDelete.includes(image.id) && (
                            <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                              <span className="text-red-700 font-semibold text-xs bg-white px-2 py-1 rounded">
                                삭제됨
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 삭제/복원 버튼 */}
                        {editForm.imagesToDelete.includes(image.id) ? (
                          <button
                            type="button"
                            onClick={() => handleExistingImageRestore(image.id)}
                            className="absolute -top-1 md:-top-2 -right-1 md:-right-2 bg-green-500 text-white rounded-full w-5 md:w-6 h-5 md:h-6 flex items-center justify-center text-xs hover:bg-green-600 transition-colors shadow-lg border-2 border-white"
                            title="이미지 복원"
                          >
                            ↶
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleExistingImageRemove(image.id)}
                            className="absolute -top-1 md:-top-2 -right-1 md:-right-2 bg-red-500 text-white rounded-full w-5 md:w-6 h-5 md:h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg border-2 border-white"
                            title="이미지 삭제"
                          >
                            <FiX />
                          </button>
                        )}

                        {/* 이미지 정보 */}
                        <div className="mt-1 md:mt-2 space-y-1">
                          <div className="text-xs text-gray-600 truncate font-medium">
                            {image.originalName}
                          </div>
                          <div className="text-xs text-gray-500">{formatFileSize(image.size)}</div>
                          {editForm.imagesToDelete.includes(image.id) && (
                            <div className="text-xs text-red-600 font-medium">삭제 예정</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 이미지 추가 */}
              <div>
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <label className="text-xs md:text-sm font-medium text-gray-900">
                    새 이미지 추가
                    <span className="text-xs text-gray-500 ml-1 md:ml-2">(최대 5장)</span>
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    현재 총{' '}
                    {editForm.existingImages.length -
                      editForm.imagesToDelete.length +
                      editForm.newImages.length}
                    /5장
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,.jpg,.png,.webp"
                  onChange={handleNewImageSelect}
                  className="w-full p-2 md:p-3 border border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors file:mr-2 md:file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded-lg file:border-0 file:text-xs md:file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  disabled={
                    isSubmitting ||
                    editForm.existingImages.length -
                      editForm.imagesToDelete.length +
                      editForm.newImages.length >=
                      5
                  }
                />
                <div className="mt-1 md:mt-2">
                  <p className="text-xs text-gray-500">JPG, PNG, WEBP 파일만 가능합니다.</p>
                  {editForm.existingImages.length -
                    editForm.imagesToDelete.length +
                    editForm.newImages.length >=
                    5 && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mt-1">
                      ⚠️ 최대 5장까지만 업로드할 수 있습니다.
                    </p>
                  )}
                </div>
              </div>

              {/* 새로 추가된 이미지들 */}
              {editForm.newImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h5 className="text-xs md:text-sm font-medium text-gray-900">
                      새로 추가된 이미지 ({editForm.newImages.length}개)
                    </h5>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      새로 추가됨
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 md:gap-3">
                    {editForm.newImages.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-green-200 hover:border-green-300 transition-colors">
                          <img
                            src={editForm.newImagePreviewUrls[index]}
                            alt={`새 이미지 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* 새 이미지 표시 */}
                          <div className="absolute top-1 left-1">
                            <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-medium">
                              NEW
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNewImageRemove(index)}
                          className="absolute -top-1 md:-top-2 -right-1 md:-right-2 bg-red-500 text-white rounded-full w-5 md:w-6 h-5 md:h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg border-2 border-white"
                          title="새 이미지 제거"
                        >
                          <FiX />
                        </button>
                        <div className="mt-1 md:mt-2 space-y-1">
                          <div className="text-xs text-gray-600 truncate font-medium">
                            {image.name}
                          </div>
                          <div className="text-xs text-gray-500">{formatFileSize(image.size)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 - 고정 */}
        <div className="p-3 md:p-4 border-t bg-white rounded-b-lg flex-shrink-0">
          {/* 진행 상황 표시 */}
          <div className="bg-gray-50 rounded-lg p-2 md:p-3 mb-3">
            <div className="flex items-center justify-between text-xs md:text-sm mb-2 md:mb-3">
              <span className="text-gray-600 font-medium">수정 진행 상황</span>
              <span className="font-medium text-gray-800">
                (
                {
                  [
                    editForm.serviceType,
                    editForm.rating > 0,
                    editForm.content.trim().length >= 10,
                  ].filter(Boolean).length
                }
                /3)
              </span>
            </div>
            <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
              <div
                className={`flex items-center gap-2 ${editForm.serviceType ? 'text-green-600' : 'text-gray-500'}`}
              >
                <span>{editForm.serviceType ? '✓' : '○'}</span>
                서비스 유형 선택
              </div>
              <div
                className={`flex items-center gap-2 ${editForm.rating > 0 ? 'text-green-600' : 'text-gray-500'}`}
              >
                <span>{editForm.rating > 0 ? '✓' : '○'}</span>
                별점 선택
              </div>
              <div
                className={`flex items-center justify-between ${editForm.content.trim().length >= 10 ? 'text-green-600' : 'text-gray-500'}`}
              >
                <div className="flex items-center gap-2">
                  <span>{editForm.content.trim().length >= 10 ? '✓' : '○'}</span>
                  리뷰 내용 작성 (최소 10자)
                </div>
                {editForm.content.trim().length < 10 && (
                  <span className="text-xs text-gray-400">{editForm.content.length}/10</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting || uploadProgress}
              className="flex-1 py-2 md:py-3 px-3 md:px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || uploadProgress || editForm.content.trim().length < 10}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base ${
                isSubmitting || uploadProgress || editForm.content.trim().length < 10
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  저장 중...
                </>
              ) : uploadProgress ? (
                <>
                  <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  업로드 중...
                </>
              ) : (
                '저장하기'
              )}
            </button>
          </div>

          {(isSubmitting || uploadProgress) && (
            <p className="mt-1 md:mt-2 text-xs text-center text-gray-600">
              완료될 때까지 화면을 끄지 마시고 잠시만 기다려주세요.
            </p>
          )}
        </div>
      </div>

      {/* 업로드 진행률 모달 */}
      <ReviewUploadProgress progress={uploadProgress} />
    </div>
  );
};

export default ReviewEditModal;
