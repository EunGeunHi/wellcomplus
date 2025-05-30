'use client';
import { useState, useEffect, lazy, Suspense } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiLogOut,
  FiChevronRight,
  FiFileText,
  FiHelpCircle,
  FiEdit,
  FiX,
  FiStar,
} from 'react-icons/fi';

import { formatDate } from '@/utils/dateFormat';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// 지연 로딩할 컴포넌트들
const EstimateContent = lazy(() => import('./components/EstimateContent'));
const AsContent = lazy(() => import('./components/AsContent'));
const ReviewContent = lazy(() => import('./components/ReviewContent'));

const UserPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [activeMenu, setActiveMenu] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // 페이지네이션 적용: 초기에는 5개만 로드
        const response = await fetch(`/api/users/${params.id}?page=1&limit=5`);

        if (!response.ok) {
          throw new Error('사용자 정보를 불러오는데 실패했습니다');
        }

        const data = await response.json();
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error('사용자 데이터를 가져오는 중 오류 발생:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUserData();
    }
  }, [params.id]);

  const menuItems = [
    { id: 'profile', label: '프로필', icon: <FiUser /> },
    { id: 'estimate', label: '견적 신청 내역', icon: <FiFileText /> },
    { id: 'as', label: 'AS 및 문의 내역', icon: <FiHelpCircle /> },
    { id: 'review', label: '리뷰 작성', icon: <FiStar /> },
  ];

  // 스켈레톤 UI 컴포넌트
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>

      {/* 콘텐츠 스켈레톤 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-12 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    // 로딩 중일 때 스켈레톤 UI 표시
    if (loading) return <SkeletonLoader />;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!userData) return <div className="p-10 text-center">사용자 정보를 찾을 수 없습니다.</div>;

    // 탭별 로딩 스켈레톤
    const TabSkeleton = () => (
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    switch (activeMenu) {
      case 'profile':
        return <ProfileContent userData={userData} onUserUpdate={setUserData} />;
      case 'estimate':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <EstimateContent userData={userData} userId={params.id} />
          </Suspense>
        );
      case 'as':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <AsContent userData={userData} userId={params.id} />
          </Suspense>
        );
      case 'review':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <ReviewContent userData={userData} userId={params.id} />
          </Suspense>
        );
      default:
        return <ProfileContent userData={userData} onUserUpdate={setUserData} />;
    }
  };

  return (
    <LoggedInOnlySection fallback={<LoginFallback />}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['NanumGothic'] p-4 sm:p-8">
        <div className="max-w-7xl mx-auto flex gap-4 sm:gap-8 flex-col md:flex-row">
          <div className="w-full md:w-80 flex flex-col gap-4 sm:gap-6">
            <nav className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-lg flex flex-col gap-1 sm:gap-2">
              {loading ? (
                // 네비게이션 스켈레톤
                <div className="animate-pulse space-y-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-12 bg-gray-200 rounded-lg"></div>
                  ))}
                  <div className="h-12 bg-red-100 rounded-lg mt-4"></div>
                </div>
              ) : (
                <>
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      className={`flex items-center justify-between p-3 sm:p-4 w-full border-none rounded-lg text-sm sm:text-base cursor-pointer transition-all duration-200 
                      ${
                        activeMenu === item.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-transparent text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveMenu(item.id)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-base sm:text-lg">{item.icon}</span>
                        {item.label}
                      </div>
                      <FiChevronRight
                        size={16}
                        className={`transition-all duration-200 
                        ${
                          activeMenu === item.id
                            ? 'opacity-100 transform-none'
                            : 'opacity-0 -translate-x-2'
                        }
                      `}
                      />
                    </button>
                  ))}
                  <button className="flex items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-4 p-3 sm:p-4 bg-white text-red-500 border border-red-100 rounded-lg text-sm sm:text-base cursor-pointer transition-all duration-200 hover:bg-red-50">
                    <FiLogOut size={16} className="sm:text-lg" />
                    로그아웃
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="flex-1 flex flex-col gap-4 sm:gap-6">
            <main className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </LoggedInOnlySection>
  );
};

const ProfileContent = ({ userData, onUserUpdate }) => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState(userData?.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.user?.name || '',
    phoneNumber: userData?.user?.phoneNumber || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNameChanged, setIsNameChanged] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isNameValid, setIsNameValid] = useState(true);

  // userData가 변경될 때 user와 formData 업데이트
  useEffect(() => {
    if (userData?.user) {
      setUser(userData.user);
      setFormData({
        name: userData.user.name || '',
        phoneNumber: userData.user.phoneNumber || '',
      });
    }
  }, [userData]);

  // 토스트 상태 추가
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: '', // 'success' 또는 'error'
  });

  // 유틸리티 함수들
  const formatKoreanPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  };

  // 토스트 메시지 표시 함수
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type,
    });

    // 3초 후 토스트 숨김
    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));

      // 애니메이션 완료 후 메시지 초기화
      setTimeout(() => {
        setToast({
          visible: false,
          message: '',
          type: '',
        });
      }, 300);
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      // 전화번호 자동 포맷팅
      const formattedValue = formatKoreanPhoneNumber(value);

      // 유효성 검사
      setIsPhoneValid(formattedValue.length === 0 || isValidPhoneNumber(formattedValue));

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else if (name === 'name') {
      // 이름 길이 제한 (15자)
      if (value.length <= 15) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
        setIsNameValid(true);

        // 이름이 원래 이름과 다른지 확인
        const isChanged = value !== user.name;
        setIsNameChanged(isChanged);

        // 상태 초기화 (서버에서 검증하므로 클라이언트 검증 제거)
      } else {
        setIsNameValid(false);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로필 업데이트에 실패했습니다.');
      }

      // 성공 처리
      const updatedUserData = {
        ...user,
        name: data.user.name,
        phoneNumber: data.user.phoneNumber,
      };

      setUser(updatedUserData);
      setFormData({
        name: data.user.name,
        phoneNumber: data.user.phoneNumber,
      });

      // 부모 컴포넌트의 상태 업데이트 (올바른 구조로 전달)
      if (onUserUpdate) {
        onUserUpdate({
          ...userData,
          user: updatedUserData,
        });
      }

      // 세션 갱신 (API 응답에 sessionUser가 있는 경우)
      if (data.sessionUser && updateSession) {
        await updateSession({
          ...session,
          user: {
            ...session.user,
            ...data.sessionUser,
          },
        });

        // 세션 변경을 다른 컴포넌트(Navigation)에 알리기 위한 이벤트 발생
        const event = new StorageEvent('storage', {
          key: 'next-auth.session-token',
          newValue: 'updated',
          url: window.location.href,
        });
        window.dispatchEvent(event);
      }

      // 성공 토스트 표시
      showToast('프로필이 성공적으로 업데이트되었습니다!', 'success');

      // 1초 후 모달 닫기
      setTimeout(() => {
        setIsModalOpen(false);
        setIsNameChanged(false);
      }, 1000);
    } catch (err) {
      // 에러 토스트 표시
      showToast(err.message, 'error');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div>로딩중...</div>;

  return (
    <>
      {/* 토스트 메시지 */}
      {toast.visible && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-300 
          ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
        >
          <div
            className={`py-3 px-6 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium
            ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            {toast.type === 'error' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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

      <section className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 relative pb-2 sm:pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 sm:after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
            프로필
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-4 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs sm:text-sm font-medium"
          >
            <FiEdit size={14} className="sm:text-base" />
            이름, 전화번호 수정
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-center text-base sm:text-lg text-indigo-600 bg-indigo-50 w-8 h-8 sm:w-10 sm:h-10 rounded-lg">
              <FiUser />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-500 mb-0.5">이름</div>
              <div className="text-base sm:text-lg text-gray-900 font-semibold">{user.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-center text-lg text-indigo-600 bg-indigo-50 w-10 h-10 rounded-lg">
              <FiMail />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-0.5">이메일</div>
              <div className="text-lg text-gray-900 font-semibold">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-center text-lg text-indigo-600 bg-indigo-50 w-10 h-10 rounded-lg">
              <FiPhone />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-0.5">전화번호</div>
              <div className="text-lg text-gray-900 font-semibold">{user.phoneNumber}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-center text-lg text-indigo-600 bg-indigo-50 w-10 h-10 rounded-lg">
              <FiCalendar />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-0.5">가입일</div>
              <div className="text-lg text-gray-900 font-semibold">
                {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 정보 수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => !isLoading && setIsModalOpen(false)}
          ></div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md z-10 relative">
            {/* 로딩 오버레이 */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-indigo-600 font-medium">저장 중...</p>
                  <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
                </div>
              </div>
            )}

            <button
              onClick={() => !isLoading && setIsModalOpen(false)}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="닫기"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              프로필 정보 수정
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={15}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isNameValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="이름을 입력하세요"
                />
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    최대 15자까지 입력 가능합니다. 현재 {formData.name.length}자
                  </p>
                  {!isNameValid && (
                    <p className="text-xs text-red-500">이름은 15자 이하여야 합니다.</p>
                  )}
                  {isNameChanged && (
                    <p className="text-xs text-blue-600">
                      💡 이름 중복 확인은 저장 시 자동으로 처리됩니다.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  전화번호
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isPhoneValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="전화번호를 입력하세요"
                />
                <p className="mt-1 text-xs text-gray-500">
                  숫자만 입력하시면 됩니다. (예시: 010-1234-5678)
                </p>
                {!isPhoneValid && (
                  <p className="mt-1 text-xs text-red-500">유효한 전화번호 형식이 아닙니다.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isPhoneValid || !isNameValid}
                  className={`flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2
                    ${
                      isLoading || !isPhoneValid || !isNameValid
                        ? 'opacity-70 cursor-not-allowed'
                        : ''
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      저장 중...
                    </>
                  ) : (
                    '저장하기'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserPage;
