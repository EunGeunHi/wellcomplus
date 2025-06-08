'use client';

import { useState, useEffect } from 'react';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiEye,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiFileText,
  FiStar,
  FiUsers,
  FiX,
  FiExternalLink,
  FiClock,
} from 'react-icons/fi';

export default function UsersManagePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    authority: '',
    dateRange: '',
    hasServices: '',
    hasReviews: '',
  });

  // 사용자 목록 조회
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/manage/users');
      if (!response.ok) {
        throw new Error('사용자 목록을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('사용자 목록 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 상세 정보 조회
  const fetchUserDetails = async (userId) => {
    try {
      setDetailsLoading(true);

      const response = await fetch(`/api/manage/users/${userId}`);
      if (!response.ok) {
        throw new Error('사용자 상세 정보를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setUserDetails(data);
    } catch (err) {
      console.error('사용자 상세 정보 조회 오류:', err);
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  // 모달 열기
  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setShowModal(true);
    await fetchUserDetails(user._id);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setUserDetails(null);
  };

  // 필터링된 사용자 목록
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);

    const matchesAuthority = !filters.authority || user.authority === filters.authority;
    const matchesServices =
      !filters.hasServices ||
      (filters.hasServices === 'yes' && user.serviceCount > 0) ||
      (filters.hasServices === 'no' && user.serviceCount === 0);
    const matchesReviews =
      !filters.hasReviews ||
      (filters.hasReviews === 'yes' && user.reviewCount > 0) ||
      (filters.hasReviews === 'no' && user.reviewCount === 0);

    return matchesSearch && matchesAuthority && matchesServices && matchesReviews;
  });

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 권한 표시
  const getAuthorityBadge = (authority) => {
    const styles = {
      king: 'bg-red-100 text-red-800',
      user: 'bg-blue-100 text-blue-800',
      guest: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      king: '관리자',
      user: '일반회원',
      guest: '게스트',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[authority] || styles.guest}`}
      >
        {labels[authority] || '알 수 없음'}
      </span>
    );
  };

  // 가입 방식 표시
  const getProviderBadge = (provider) => {
    const providers = {
      google: { name: '구글', color: 'bg-red-50 text-red-700' },
      naver: { name: '네이버', color: 'bg-green-50 text-green-700' },
      kakao: { name: '카카오', color: 'bg-yellow-50 text-yellow-700' },
      credentials: { name: '일반가입', color: 'bg-blue-50 text-blue-700' },
    };

    const providerInfo = providers[provider] || {
      name: provider || '알 수 없음',
      color: 'bg-gray-50 text-gray-700',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${providerInfo.color}`}>
        {providerInfo.name}
      </span>
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <KingOnlySection fallback={<KingFallback />}>
      <div className="min-h-screen bg-gray-50 font-['NanumGothic']">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">유저 관리</h1>
                <p className="text-gray-600">가입된 사용자들의 정보와 활동 내역을 관리합니다</p>
              </div>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                새로고침
              </button>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* 검색 */}
              <div className="relative md:col-span-2">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="이름, 이메일, 전화번호 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* 권한 필터 */}
              <select
                value={filters.authority}
                onChange={(e) => setFilters((prev) => ({ ...prev, authority: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">모든 권한</option>
                <option value="king">관리자</option>
                <option value="user">일반회원</option>
                <option value="guest">게스트</option>
              </select>

              {/* 서비스 신청 필터 */}
              <select
                value={filters.hasServices}
                onChange={(e) => setFilters((prev) => ({ ...prev, hasServices: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">서비스 신청</option>
                <option value="yes">신청 있음</option>
                <option value="no">신청 없음</option>
              </select>

              {/* 리뷰 작성 필터 */}
              <select
                value={filters.hasReviews}
                onChange={(e) => setFilters((prev) => ({ ...prev, hasReviews: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">리뷰 작성</option>
                <option value="yes">리뷰 있음</option>
                <option value="no">리뷰 없음</option>
              </select>

              {/* 필터 초기화 */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ authority: '', dateRange: '', hasServices: '', hasReviews: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="inline mr-2" />
                초기화
              </button>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FiUsers className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FiUser className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">일반회원</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.authority === 'user').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FiFileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">서비스 신청자</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.serviceCount > 0).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FiStar className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">리뷰 작성자</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.reviewCount > 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 사용자 목록 */}
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">사용자 목록을 불러오는 중...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center text-red-600">
                <p className="font-medium">오류가 발생했습니다</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        권한/가입방식
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        마지막 접속
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        활동
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.image ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.image}
                                  alt={user.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <FiUser className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiMail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                              {user.phoneNumber && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <FiPhone className="h-3 w-3 mr-1" />
                                  {user.phoneNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {getAuthorityBadge(user.authority)}
                            {getProviderBadge(user.provider)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="h-4 w-4 mr-1" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiClock className="h-4 w-4 mr-1" />
                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : '정보 없음'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-4">
                            <div className="flex items-center text-blue-600">
                              <FiFileText className="h-4 w-4 mr-1" />
                              서비스 {user.serviceCount || 0}
                            </div>
                            <div className="flex items-center text-yellow-600">
                              <FiStar className="h-4 w-4 mr-1" />
                              리뷰 {user.reviewCount || 0}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserClick(user)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <FiEye className="h-4 w-4 mr-1" />
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">검색 결과가 없습니다.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 상세 정보 모달 */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">{selectedUser.name} 상세 정보</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {detailsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">상세 정보를 불러오는 중...</span>
                  </div>
                ) : userDetails ? (
                  <div className="space-y-6">
                    {/* 기본 정보 */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-600">이름:</span>
                          <p className="text-sm text-gray-900">{selectedUser.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">이메일:</span>
                          <p className="text-sm text-gray-900">{selectedUser.email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">전화번호:</span>
                          <p className="text-sm text-gray-900">
                            {selectedUser.phoneNumber || '정보 없음'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">권한:</span>
                          <p className="text-sm text-gray-900">
                            {getAuthorityBadge(selectedUser.authority)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">가입 방식:</span>
                          <p className="text-sm text-gray-900">
                            {getProviderBadge(selectedUser.provider)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">가입일:</span>
                          <p className="text-sm text-gray-900">
                            {formatDate(selectedUser.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 서비스 신청 내역 */}
                    {userDetails.services && userDetails.services.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          서비스 신청 내역 ({userDetails.services.length}건)
                        </h4>
                        <div className="space-y-3">
                          {userDetails.services.map((service, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {service.type || '알 수 없음'}
                                  </span>
                                  <span
                                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                      service.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : service.status === 'in_progress'
                                          ? 'bg-blue-100 text-blue-800'
                                          : service.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {service.status === 'completed'
                                      ? '완료'
                                      : service.status === 'in_progress'
                                        ? '진행중'
                                        : service.status === 'cancelled'
                                          ? '취소'
                                          : '신청'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(service.createdAt)}
                                </div>
                              </div>
                              {service.content && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {service.content.length > 100
                                    ? service.content.substring(0, 100) + '...'
                                    : service.content}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 리뷰 내역 */}
                    {userDetails.reviews && userDetails.reviews.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          리뷰 내역 ({userDetails.reviews.length}건)
                        </h4>
                        <div className="space-y-3">
                          {userDetails.reviews.map((review, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900">
                                    {review.serviceType || '알 수 없음'}
                                  </span>
                                  <div className="ml-2 flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <FiStar
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span
                                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                      review.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : review.status === 'hidden'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {review.status === 'active'
                                      ? '활성'
                                      : review.status === 'hidden'
                                        ? '숨김'
                                        : '대기'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(review.createdAt)}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {review.content.length > 150
                                  ? review.content.substring(0, 150) + '...'
                                  : review.content}
                              </p>
                              {review.imageCount > 0 && (
                                <div className="mt-2 text-xs text-gray-500">
                                  📷 이미지 {review.imageCount}개
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 데이터가 없는 경우 */}
                    {(!userDetails.services || userDetails.services.length === 0) &&
                      (!userDetails.reviews || userDetails.reviews.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <p>서비스 신청 내역과 리뷰가 없습니다.</p>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-red-600">
                    상세 정보를 불러오는데 실패했습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </KingOnlySection>
  );
}
