'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiX } from 'react-icons/fi';

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
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('JPG, PNG 파일만 업로드 가능합니다.');
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
      const hasImageChanges = editForm.newImages.length > 0 || editForm.imagesToDelete.length > 0;

      if (hasImageChanges) {
        const formData = new FormData();
        formData.append('content', editForm.content);
        formData.append('rating', editForm.rating.toString());
        formData.append('serviceType', editForm.serviceType);
        formData.append('keepExistingImages', 'true');

        editForm.imagesToDelete.forEach((imageId) => {
          formData.append('imagesToDelete', imageId);
        });

        editForm.newImages.forEach((image) => {
          formData.append('images', image);
        });

        const response = await fetch(`/api/reviews/${review.id}`, {
          method: 'PATCH',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '리뷰 수정에 실패했습니다.');
        }
      } else {
        const response = await fetch(`/api/reviews/${review.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: editForm.content,
            rating: editForm.rating,
            serviceType: editForm.serviceType,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '리뷰 수정에 실패했습니다.');
        }
      }

      showToast('리뷰가 성공적으로 수정되었습니다.', 'success');

      // 새 이미지 미리보기 URL들 정리
      editForm.newImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

      onSave(); // 상위 컴포넌트에 저장 완료 알림
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">리뷰 수정</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            {/* 서비스 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">서비스 타입</label>
              <select
                name="serviceType"
                value={editForm.serviceType}
                onChange={handleEditFormChange}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">별점</label>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="text-2xl focus:outline-none"
                  >
                    <FiStar
                      className={`${
                        editForm.rating >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  {editForm.rating > 0 ? `${editForm.rating}점` : '별점을 선택해주세요'}
                </span>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">리뷰 내용</label>
              <textarea
                name="content"
                value={editForm.content}
                onChange={handleEditFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
                rows={6}
                placeholder="리뷰 내용을 입력하세요"
              />
              <p className="mt-1 text-xs text-gray-500">
                최소 10자 이상 작성해주세요. 현재 {editForm.content.length}자
              </p>
            </div>

            {/* 이미지 관리 */}
            <div className="space-y-4">
              {/* 기존 이미지들 */}
              {editForm.existingImages && editForm.existingImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">
                      기존 이미지 ({editForm.existingImages.length - editForm.imagesToDelete.length}
                      /{editForm.existingImages.length})
                    </h5>
                    <div className="flex items-center gap-2">
                      {editForm.imagesToDelete.length > 0 && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          {editForm.imagesToDelete.length}개 삭제 예정
                        </span>
                      )}
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        클릭/터치로 삭제
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editForm.existingImages.map((image, index) => (
                      <div key={image.id || index} className="relative">
                        <div
                          className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                            editForm.imagesToDelete.includes(image.id)
                              ? 'opacity-50 grayscale border-red-300'
                              : 'border-gray-200 hover:border-indigo-300 active:border-indigo-400'
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
                              <span className="text-red-700 font-semibold text-sm bg-white px-2 py-1 rounded">
                                삭제됨
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 삭제/복원 버튼 - 모바일 친화적으로 항상 표시 */}
                        {editForm.imagesToDelete.includes(image.id) ? (
                          <button
                            type="button"
                            onClick={() => handleExistingImageRestore(image.id)}
                            className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg border-2 border-white"
                            title="이미지 복원"
                          >
                            ↶
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleExistingImageRemove(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 active:bg-red-700 transition-colors shadow-lg border-2 border-white"
                            title="이미지 삭제"
                          >
                            <FiX />
                          </button>
                        )}

                        {/* 이미지 정보 */}
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-gray-500 truncate">{image.originalName}</div>
                          <div className="text-xs text-gray-400">{formatFileSize(image.size)}</div>
                          {editForm.imagesToDelete.includes(image.id) && (
                            <div className="text-xs text-red-600 font-medium">삭제 예정</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 도움말 텍스트 */}
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 <strong>이미지 관리 방법:</strong>
                    </p>
                    <ul className="text-xs text-blue-600 mt-1 space-y-1">
                      <li>• 이미지 우측 상단의 삭제 버튼(×)을 터치하여 삭제할 수 있습니다</li>
                      <li>• 삭제된 이미지는 복원 버튼(↶)으로 되돌릴 수 있습니다</li>
                      <li>• 저장 시 삭제 예정 이미지들이 실제로 제거됩니다</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 새 이미지 추가 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">새 이미지 추가</label>
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
                  accept="image/jpeg,image/png,.jpg,.png"
                  onChange={handleNewImageSelect}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  disabled={
                    editForm.existingImages.length -
                      editForm.imagesToDelete.length +
                      editForm.newImages.length >=
                    5
                  }
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">JPG, PNG 파일만 업로드 가능합니다.</p>
                  {editForm.existingImages.length -
                    editForm.imagesToDelete.length +
                    editForm.newImages.length >=
                    5 && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      ⚠️ 최대 5장까지만 업로드할 수 있습니다. 기존 이미지를 삭제하거나 새 이미지를
                      제거해주세요.
                    </p>
                  )}
                </div>
              </div>

              {/* 새로 추가된 이미지들 */}
              {editForm.newImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">
                      새로 추가된 이미지 ({editForm.newImages.length}개)
                    </h5>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      새로 추가됨
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editForm.newImages.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200 hover:border-green-300 active:border-green-400 transition-all">
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
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 active:bg-red-700 transition-colors shadow-lg border-2 border-white"
                          title="새 이미지 제거"
                        >
                          <FiX />
                        </button>
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-gray-500 truncate">{image.name}</div>
                          <div className="text-xs text-gray-400">{formatFileSize(image.size)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewEditModal;
