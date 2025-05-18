'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FiStar,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiClipboard,
  FiUser,
  FiCalendar,
  FiRefreshCw,
  FiInfo,
  FiSearch,
  FiX,
  FiBox,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { formatDate } from '@/utils/dateFormat';
import KingFallback from '@/app/components/kingFallback';

// 서비스 유형에 따른 아이콘과 텍스트
const serviceTypeInfo = {
  computer: { icon: '🖥️', text: '컴퓨터 견적' },
  printer: { icon: '🖨️', text: '프린터 견적' },
  notebook: { icon: '💻', text: '노트북 견적' },
  as: { icon: '🔧', text: 'AS 서비스' },
  other: { icon: '❓', text: '기타' },
};

// 상태에 따른 배지 스타일
const statusBadgeStyle = {
  register: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  active: 'bg-green-100 text-green-700 border border-green-200',
  hidden: 'bg-gray-100 text-gray-700 border border-gray-200',
  deleted: 'bg-red-100 text-red-700 border border-red-200',
};

// 상태에 따른 한글 텍스트
const statusText = {
  register: '승인대기',
  active: '공개',
  hidden: '숨김',
  deleted: '삭제됨',
};

// 토스트 메시지 컴포넌트
function Toast({ message, type, visible, onClose }) {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
    >
      <div
        className={`py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium
        ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
      >
        {type === 'success' ? (
          <FiCheck className="text-white" />
        ) : (
          <FiAlertCircle className="text-white" />
        )}
        {message}
      </div>
    </div>
  );
}

// 별점 표시 컴포넌트
function StarRating({ rating }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewManagementPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('register');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // 탭 메뉴 정의
  const tabs = [
    { id: 'register', label: '승인대기', icon: <FiClipboard /> },
    { id: 'active', label: '공개', icon: <FiEye /> },
    { id: 'hidden', label: '숨김', icon: <FiEyeOff /> },
    { id: 'deleted', label: '삭제됨', icon: <FiTrash2 /> },
  ];

  // 데이터 로드 함수
  const fetchReviews = async (status, search = searchQuery, type = serviceTypeFilter) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedReview(null);
      setIsSearching(!!search || !!type);

      // URL 파라미터 구성
      const params = new URLSearchParams();
      params.append('status', status);
      if (search) params.append('search', search);
      if (type) params.append('type', type);

      const response = await fetch(`/api/reviews?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('리뷰 데이터 로드 중 오류:', err);
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행 함수
  const handleSearch = (e) => {
    e.preventDefault();
    fetchReviews(activeTab);
  };

  // 검색 초기화 함수
  const clearSearch = () => {
    setSearchQuery('');
    setServiceTypeFilter('');
    fetchReviews(activeTab, '', '');
  };

  // 토스트 메시지 표시 함수
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    // 2초 후에 토스트 메시지 숨기기
    setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  };

  // 상태 변경 함수
  const handleStatusChange = async (id, newStatus) => {
    if (!id || !newStatus) return;

    try {
      setUpdateLoading(true);

      const response = await fetch('/api/reviews/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '상태 변경에 실패했습니다.');
      }

      const data = await response.json();

      // 현재 선택된 리뷰 정보 업데이트
      setSelectedReview({
        ...selectedReview,
        status: newStatus,
      });

      // 목록 새로고침
      await fetchReviews(activeTab);

      // 성공 메시지 표시
      showToast(`상태가 '${statusText[newStatus]}'으로 변경되었습니다.`, 'success');
    } catch (err) {
      console.error('상태 변경 중 오류:', err);
      showToast(err.message, 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  // 탭 변경 시 해당 상태의 데이터 로드
  useEffect(() => {
    if (status === 'authenticated') {
      fetchReviews(activeTab);
    }
  }, [activeTab, status]);

  // 항목 선택 처리 함수
  const handleItemSelect = (review) => {
    setSelectedReview(review);
  };

  // 상태 변경 버튼 렌더링
  const renderStatusChangeButtons = (review) => {
    // 현재 상태를 제외한 모든 가능한 상태에 대한 버튼 생성
    const buttonStyles = {
      register: 'bg-yellow-600 hover:bg-yellow-700',
      active: 'bg-green-600 hover:bg-green-700',
      hidden: 'bg-gray-600 hover:bg-gray-700',
      deleted: 'bg-red-600 hover:bg-red-700',
    };

    return Object.entries(statusText)
      .filter(([key]) => key !== review.status) // 현재 상태 제외
      .map(([status, label]) => (
        <button
          key={status}
          onClick={() => handleStatusChange(review._id, status)}
          disabled={updateLoading}
          className={`px-4 py-2 text-white rounded-md ${buttonStyles[status]} transition-colors ${
            updateLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {`${label}으로 변경`}
        </button>
      ));
  };

  // 세션 로딩 중이면 로딩 표시
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 정보를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 관리자가 아니면 접근 거부 메시지
  if (status === 'authenticated' && session.user.authority !== 'king') {
    return <KingFallback />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* 헤더 */}
          <header className="bg-white shadow-sm rounded-lg p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">리뷰 관리</h1>
            <p className="text-gray-600 mt-2 mb-4">고객의 리뷰를 관리할 수 있습니다.</p>

            {/* 검색 및 필터 */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="내용으로 검색..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="min-w-[80px] py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiSearch className="inline mr-1" /> 검색
                </button>
              </form>

              <div className="flex gap-2">
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => {
                    setServiceTypeFilter(e.target.value);
                    fetchReviews(activeTab, searchQuery, e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">모든 서비스</option>
                  <option value="computer">컴퓨터 견적</option>
                  <option value="printer">프린터 견적</option>
                  <option value="notebook">노트북 견적</option>
                  <option value="as">AS 서비스</option>
                  <option value="other">기타</option>
                </select>

                {(searchQuery || serviceTypeFilter) && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <FiX size={14} /> 초기화
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* 탭 메뉴 */}
          <div className="flex overflow-x-auto bg-white shadow-sm rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center px-4 py-3 rounded-md min-w-[120px] ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors whitespace-nowrap`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 메인 컨텐츠 */}
          <div className="flex flex-col gap-6">
            {/* 리뷰 목록 (테이블 형식) */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find((tab) => tab.id === activeTab)?.label} 리뷰 목록
                  {isSearching && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      {reviews.length > 0 ? `검색 결과: ${reviews.length}건` : '검색 결과 없음'}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => fetchReviews(activeTab)}
                  className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                  title="새로고침"
                >
                  <FiRefreshCw />
                </button>
              </div>

              {loading ? (
                <div className="py-32 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">데이터를 불러오는 중입니다...</p>
                </div>
              ) : error ? (
                <div className="py-32 text-center">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-red-500 mb-2">오류가 발생했습니다</p>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => fetchReviews(activeTab)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-32 text-center">
                  <div className="text-gray-400 text-4xl mb-4">📭</div>
                  <p className="text-gray-600 mb-2">데이터가 없습니다</p>
                  <p className="text-gray-500 text-sm">
                    {statusText[activeTab]} 상태의 리뷰가 없습니다.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          유형
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          평점
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          내용 미리보기
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          작성자
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          작성일
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reviews.map((review) => (
                        <tr
                          key={review._id}
                          onClick={() => handleItemSelect(review)}
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedReview?._id === review._id ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-xl mr-2">
                                {serviceTypeInfo[review.serviceType]?.icon || '📋'}
                              </span>
                              <span className="text-sm text-gray-900">
                                {serviceTypeInfo[review.serviceType]?.text || review.serviceType}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StarRating rating={review.rating} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {review.content}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {review.userId?.name || '알 수 없음'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {review.userId?.email || '이메일 없음'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                statusBadgeStyle[review.status]
                              }`}
                            >
                              {statusText[review.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 선택된 리뷰 상세 정보 */}
            {selectedReview && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">리뷰 상세 정보</h2>

                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">리뷰 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiBox size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">서비스 유형</p>
                          <p className="font-medium">
                            {serviceTypeInfo[selectedReview.serviceType]?.text ||
                              selectedReview.serviceType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiStar size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">평점</p>
                          <StarRating rating={selectedReview.rating} />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiUser size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">작성자</p>
                          <p className="font-medium">
                            {selectedReview.userId?.name || '알 수 없음'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiCalendar size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">작성일</p>
                          <p className="font-medium">{formatDate(selectedReview.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiTrash2 size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">
                            사용자가 직접 삭제 여부(활성:삭제안함, 삭제됨:삭제함)
                          </p>
                          <p className="font-medium">
                            {selectedReview.isDeleted ? (
                              <span className="text-red-500">삭제됨</span>
                            ) : (
                              <span className="text-green-500">활성</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-1">리뷰 내용</p>
                      <div className="bg-white p-4 rounded-md border border-gray-200">
                        <p className="text-gray-800 whitespace-pre-line">
                          {selectedReview.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 상태 변경 버튼 */}
                  <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mr-4 flex-shrink-0">
                      상태 변경
                    </h3>
                    {renderStatusChangeButtons(selectedReview)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
