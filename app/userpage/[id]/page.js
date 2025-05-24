'use client';
import { useState, useEffect, useRef } from 'react';
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
  FiSend,
} from 'react-icons/fi';
import { FaComputer } from 'react-icons/fa6';
import { AiFillPrinter } from 'react-icons/ai';
import { FaLaptop, FaTools } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';

import { formatDate } from '@/utils/dateFormat';
import { formatKoreanPhoneNumber, isValidPhoneNumber } from '@/utils/phoneFormatter';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const UserPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [activeMenu, setActiveMenu] = useState('estimate');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${params.id}`);

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

  const renderContent = () => {
    // 로딩 중이거나 에러가 있는 경우 처리
    if (loading) return <div className="p-10 text-center">정보를 불러오는 중입니다...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!userData) return <div className="p-10 text-center">사용자 정보를 찾을 수 없습니다.</div>;

    switch (activeMenu) {
      case 'profile':
        return <ProfileContent userData={userData} />;
      case 'estimate':
        return <EstimateContent userData={userData} userId={params.id} />;
      case 'as':
        return <AsContent userData={userData} userId={params.id} />;
      case 'review':
        return <ReviewContent userData={userData} userId={params.id} />;
      default:
        return <ProfileContent userData={userData} />;
    }
  };

  return (
    <LoggedInOnlySection fallback={<LoginFallback />}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['NanumGothic'] p-4 sm:p-8">
        <div className="max-w-7xl mx-auto flex gap-4 sm:gap-8 flex-col md:flex-row">
          <div className="w-full md:w-80 flex flex-col gap-4 sm:gap-6">
            <nav className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-lg flex flex-col gap-1 sm:gap-2">
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

const ProfileContent = ({ userData }) => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const user = userData?.user || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isNameValid, setIsNameValid] = useState(true);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameCheckMessage, setNameCheckMessage] = useState('');
  const [isNameAvailable, setIsNameAvailable] = useState(true);
  const [isNameChecked, setIsNameChecked] = useState(false);
  const [isNameChanged, setIsNameChanged] = useState(false);
  const nameCheckTimeout = useRef(null);

  // 폼 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
      });
      setIsNameChanged(false);
      setIsNameChecked(true);
      setIsNameAvailable(true);
    }
  }, [user]);

  // 이름 중복 체크 함수
  const checkNameAvailability = async () => {
    if (!formData.name || formData.name.length === 0) {
      setIsNameAvailable(false);
      setNameCheckMessage('이름을 입력해주세요.');
      setIsNameChecked(false);
      return;
    }

    try {
      setIsCheckingName(true);
      const response = await fetch('/api/users/check-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          userId: user._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsNameAvailable(data.isAvailable);
        setNameCheckMessage(data.message);
        setIsNameChecked(true);
      } else {
        throw new Error(data.error || '이름 중복 체크 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('이름 중복 체크 중 오류:', error);
      setIsNameAvailable(false);
      setNameCheckMessage('이름 중복 체크 중 오류가 발생했습니다.');
      setIsNameChecked(false);
    } finally {
      setIsCheckingName(false);
    }
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
      // 이름 길이 제한 (12자)
      if (value.length <= 12) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
        setIsNameValid(true);

        // 이름이 원래 이름과 다른지 확인
        const isChanged = value !== user.name;
        setIsNameChanged(isChanged);

        // 이름이 변경되지 않았다면 중복확인 상태 초기화
        if (!isChanged) {
          setIsNameChecked(true);
          setIsNameAvailable(true);
          setNameCheckMessage('');
        } else {
          setIsNameChecked(false);
          setNameCheckMessage('');
        }
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

    // 이름 길이 검사
    if (formData.name.length > 12) {
      setError('이름은 12자 이하여야 합니다.');
      setIsNameValid(false);
      return;
    }

    // 이름이 변경된 경우에만 중복 검사 확인
    if (isNameChanged && !isNameChecked) {
      setError('이름 중복 확인이 필요합니다.');
      return;
    }

    // 이름이 변경된 경우에만 중복 검사
    if (isNameChanged && !isNameAvailable) {
      setError('이미 사용 중인 이름입니다.');
      return;
    }

    // 전화번호 유효성 검사
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setError('유효한 전화번호 형식이 아닙니다.');
      setIsPhoneValid(false);
      return;
    }

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
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정보 업데이트에 실패했습니다.');
      }

      setSuccess('정보가 성공적으로 업데이트되었습니다.');

      // 세션 갱신 API 호출
      await refreshSession();

      // 1초 후 모달 닫기 및 페이지 새로고침
      setTimeout(() => {
        setIsModalOpen(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 갱신 함수
  const refreshSession = async () => {
    try {
      // 세션 갱신 API 호출
      const response = await fetch('/api/auth/session/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // next-auth의 세션 업데이트 기능 사용
        await updateSession();

        // 세션 변경을 다른 컴포넌트(Navigation)에 알리기 위한 이벤트 발생
        const event = new StorageEvent('storage', {
          key: 'next-auth.session-token',
          newValue: 'updated',
          url: window.location.href,
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('세션 갱신 중 오류:', error);
    }
  };

  if (!user) return <div>로딩중...</div>;

  return (
    <>
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
            프로필 수정(이름, 전화번호 2가지만 수정가능합니다.)
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
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md z-10 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      maxLength={12}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        !isNameValid || (!isNameAvailable && isNameChecked)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={checkNameAvailability}
                    disabled={isCheckingName || !formData.name || formData.name.length === 0}
                    className={`px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap
                      ${isCheckingName || !formData.name || formData.name.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isCheckingName ? '확인 중...' : '중복확인'}
                  </button>
                </div>
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    최대 12자까지 입력 가능합니다. 현재 {formData.name.length}자
                  </p>
                  {nameCheckMessage && (
                    <p className={`text-xs ${isNameAvailable ? 'text-green-500' : 'text-red-500'}`}>
                      {nameCheckMessage}
                    </p>
                  )}
                  {!isNameValid && (
                    <p className="text-xs text-red-500">이름은 12자 이하여야 합니다.</p>
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
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !isPhoneValid ||
                    !isNameValid ||
                    (isNameChanged && (!isNameAvailable || !isNameChecked))
                  }
                  className={`flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center
                    ${
                      isLoading ||
                      !isPhoneValid ||
                      !isNameValid ||
                      (isNameChanged && (!isNameAvailable || !isNameChecked))
                        ? 'opacity-70 cursor-not-allowed'
                        : ''
                    }
                  `}
                >
                  {isLoading ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const EstimateContent = ({ userData, userId }) => {
  const router = useRouter();
  const applications = userData?.applications || [];
  const filteredApplications = applications.filter(
    (app) => app.type === 'computer' || app.type === 'printer' || app.type === 'notebook'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  // 페이지 이동 핸들러
  const handleApplicationClick = (applicationId) => {
    router.push(`/userpage/${userId}/detail?applicationId=${applicationId}`);
  };

  if (filteredApplications.length === 0) {
    return (
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
          견적 신청 내역
        </h2>
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-6 text-indigo-600">
            <FiFileText size={40} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">견적 신청 내역이 없습니다</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            아직 견적을 신청한 내역이 없습니다. 견적을 신청해보세요!
          </p>
          <button className="bg-indigo-600 text-white border-none rounded-md py-3 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-indigo-700">
            견적 신청하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 relative pb-2 sm:pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 sm:after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
          견적 신청 내역
        </h2>
        <button className="bg-indigo-600 text-white border-none rounded-lg py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-indigo-700 flex items-center gap-1 sm:gap-2">
          <FiFileText size={14} className="sm:text-base" />
          견적 신청하기
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {currentApplications.map((application, index) => (
          <div
            key={index}
            className="group bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-indigo-200 flex flex-col h-full"
            onClick={() => handleApplicationClick(application._id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 mb-3">
                {application.type === 'computer' ? (
                  <FaComputer size={24} />
                ) : application.type === 'printer' ? (
                  <AiFillPrinter size={24} />
                ) : (
                  <FaLaptop size={24} />
                )}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {application.type === 'computer'
                  ? '컴퓨터 견적'
                  : application.type === 'printer'
                    ? '프린터 견적'
                    : '노트북 견적'}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                신청일: {formatDate(application.createdAt)}
              </p>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium mb-2
                ${
                  application.status === 'apply'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : application.status === 'in_progress'
                      ? 'bg-sky-100 text-sky-700 border border-sky-300'
                      : application.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : application.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {application.status === 'apply'
                  ? '신청됨'
                  : application.status === 'in_progress'
                    ? '진행중'
                    : application.status === 'completed'
                      ? '완료'
                      : application.status === 'cancelled'
                        ? '취소'
                        : '처리중'}
              </div>
              {application.status === 'apply' && (
                <div className="w-full mt-auto pt-2 text-[10px] text-gray-500 border-t border-gray-100">
                  관리자가 확인하면 진행중으로 상태가 변경됩니다.
                </div>
              )}
              {application.status === 'in_progress' && (
                <div className="w-full mt-auto pt-2 text-[10px] text-gray-500 border-t border-gray-100">
                  내용확인 후 작업 진행중입니다.
                </div>
              )}
              {application.status === 'completed' && (
                <div className="w-full mt-auto pt-2 text-[10px] text-gray-500 border-t border-gray-100">
                  신청하신 작업이 완료되었습니다.
                </div>
              )}
              {application.status === 'cancelled' && (
                <div className="w-full mt-auto pt-2 text-[10px] text-gray-500 border-t border-gray-100">
                  작업이 취소 되었습니다.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            이전
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  currentPage === index + 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

const AsContent = ({ userData, userId }) => {
  const router = useRouter();
  const applications = userData?.applications || [];
  const filteredApplications = applications.filter(
    (app) => app.type === 'as' || app.type === 'inquiry'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  // 페이지 이동 핸들러
  const handleApplicationClick = (applicationId) => {
    router.push(`/userpage/${userId}/detail?applicationId=${applicationId}`);
  };

  if (filteredApplications.length === 0) {
    return (
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
          AS 및 문의 내역
        </h2>
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-6 text-indigo-600">
            <FiHelpCircle size={40} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">문의 내역이 없습니다</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            아직 AS 신청이나 문의 내역이 없습니다. 도움이 필요하시면 문의해 주세요!
          </p>
          <button className="bg-indigo-600 text-white border-none rounded-md py-3 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-indigo-700">
            문의하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 relative pb-2 sm:pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 sm:after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
          AS 및 문의 내역
        </h2>
        <button className="bg-indigo-600 text-white border-none rounded-lg py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-indigo-700 flex items-center gap-1 sm:gap-2">
          <FiHelpCircle size={14} className="sm:text-base" />
          문의하기
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {currentApplications.map((application, index) => (
          <div
            key={index}
            className="group bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-indigo-200 flex flex-col h-full"
            onClick={() => handleApplicationClick(application._id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 mb-3">
                {application.type === 'as' ? <FaTools size={24} /> : <FiHelpCircle size={24} />}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {application.type === 'as' ? 'AS 신청' : '기타 문의'}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                신청일: {formatDate(application.createdAt)}
              </p>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium mb-2
                ${
                  application.status === 'apply'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : application.status === 'in_progress'
                      ? 'bg-sky-100 text-sky-700 border border-sky-300'
                      : application.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : application.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {application.status === 'apply'
                  ? '신청됨'
                  : application.status === 'in_progress'
                    ? '진행중'
                    : application.status === 'completed'
                      ? '완료'
                      : application.status === 'cancelled'
                        ? '취소'
                        : '처리중'}
              </div>
              {application.status === 'apply' && (
                <div className="w-full mt-auto pt-2 text-[10px] text-gray-500 border-t border-gray-100">
                  관리자가 확인하면 진행중으로 상태가 변경됩니다.
                </div>
              )}
              {application.status === 'in_progress' && (
                <div className="w-full mt-auto pt-2 text-[10px] text-gray-500 border-t border-gray-100">
                  내용확인 후 작업 진행중입니다.
                </div>
              )}
              {application.status === 'completed' && (
                <div className="w-full mt-auto pt-2 text-[10px] text-gray-500 border-t border-gray-100">
                  신청하신 작업이 완료되었습니다.
                </div>
              )}
              {application.status === 'cancelled' && (
                <div className="w-full mt-auto pt-2 text-[10px] text-gray-500 border-t border-gray-100">
                  작업이 취소 되었습니다.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            이전
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  currentPage === index + 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

const ReviewContent = ({ userData, userId }) => {
  const router = useRouter();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [userReviews, setUserReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({
    content: '',
    rating: 0,
    serviceType: '',
    existingImages: [], // 기존 이미지들
    newImages: [], // 새로 추가할 이미지들
    newImagePreviewUrls: [], // 새 이미지 미리보기 URLs
    imagesToDelete: [], // 삭제할 기존 이미지들의 ID
  });

  // 이미지 업로드 관련 상태
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageError, setImageError] = useState(''); // 이미지 갤러리 모달 상태  const [isImageModalOpen, setIsImageModalOpen] = useState(false);  const [currentImageIndex, setCurrentImageIndex] = useState(0);  const [currentImages, setCurrentImages] = useState([]);

  // 이미지 갤러리 모달 상태
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  // 토스트 상태를 하나의 객체로 관리
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: '', // 'success' 또는 'error'
  });

  // 이미지 파일 검증 함수
  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('JPG, PNG 파일만 업로드 가능합니다.');
    }

    if (file.size > maxSize) {
      throw new Error('개별 파일 크기는 10MB를 초과할 수 없습니다.');
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

      // 총 용량 체크
      const currentSize = selectedImages.reduce((sum, img) => sum + img.size, 0);
      const newSize = files.reduce((sum, file) => sum + file.size, 0);

      if (currentSize + newSize > 10 * 1024 * 1024) {
        setImageError('이미지 총 크기는 10MB를 초과할 수 없습니다.');
        return;
      }

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

  // 수정 모드용 새 이미지 선택 핸들러
  const handleEditImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // 현재 총 이미지 수 계산 (기존 - 삭제할 것들 + 새로 추가할 것들 + 지금 선택한 것들)
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

      // 새로운 이미지들과 미리보기 URL 추가
      const newImages = [...editForm.newImages, ...files];
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      const allNewPreviewUrls = [...editForm.newImagePreviewUrls, ...newPreviewUrls];

      setEditForm({
        ...editForm,
        newImages: newImages,
        newImagePreviewUrls: allNewPreviewUrls,
      });
    } catch (error) {
      showToast(error.message, 'error');
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

  // 수정 모드용 기존 이미지 삭제 핸들러
  const handleExistingImageRemove = (imageId) => {
    setEditForm({
      ...editForm,
      imagesToDelete: [...editForm.imagesToDelete, imageId],
    });
  };

  // 수정 모드용 기존 이미지 삭제 취소 핸들러
  const handleExistingImageRestore = (imageId) => {
    setEditForm({
      ...editForm,
      imagesToDelete: editForm.imagesToDelete.filter((id) => id !== imageId),
    });
  };

  // 수정 모드용 새 이미지 제거 핸들러
  const handleNewImageRemove = (index) => {
    const newImages = editForm.newImages.filter((_, i) => i !== index);
    const newPreviewUrls = editForm.newImagePreviewUrls.filter((_, i) => i !== index);

    // 기존 URL 해제
    URL.revokeObjectURL(editForm.newImagePreviewUrls[index]);

    setEditForm({
      ...editForm,
      newImages: newImages,
      newImagePreviewUrls: newPreviewUrls,
    });
  };

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      editForm.newImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // 토스트 메시지 표시 함수
  const showToast = (message, type = 'success') => {
    // 이전 타이머가 있다면 제거
    if (toast.timerId) {
      clearTimeout(toast.timerId);
    }

    // 토스트 표시
    setToast({
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
    });
  };

  // 사용자 리뷰 목록 조회
  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reviews/user/${userId}`);

        if (!response.ok) {
          throw new Error('리뷰 목록을 불러오는데 실패했습니다');
        }

        const data = await response.json();
        setUserReviews(data.reviews || []);
      } catch (err) {
        console.error('리뷰 데이터를 가져오는 중 오류 발생:', err);
        showToast(err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserReviews();
    }
  }, [userId, toast.visible]); // 의존성 배열 수정

  // 컴포넌트가 언마운트될 때 타이머 정리
  useEffect(() => {
    return () => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
    };
  }, [toast.timerId]);

  // 수정 버튼 클릭 시 호출되는 함수
  const handleEditClick = (review) => {
    setEditingReview(review.id);
    setEditForm({
      content: review.content,
      rating: review.rating,
      serviceType: review.serviceType,
      existingImages: review.images || [],
      newImages: [],
      newImagePreviewUrls: [],
      imagesToDelete: [],
    });
  };

  // 삭제 버튼 클릭 시 호출되는 함수
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 리뷰 삭제 API 호출 (isDeleted를 true로 설정) - App Router 방식 API 사용
      const response = await fetch(`/api/reviews/${reviewId}/delete`, {
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

      // 리뷰 목록에서 삭제된 리뷰 제거
      setUserReviews(userReviews.filter((review) => review.id !== reviewId));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수정 취소 버튼 클릭 시 호출되는 함수
  const handleCancelEdit = () => {
    // 새 이미지 미리보기 URL들 정리
    editForm.newImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

    setEditingReview(null);
    setEditForm({
      content: '',
      rating: 0,
      serviceType: '',
      existingImages: [],
      newImages: [],
      newImagePreviewUrls: [],
      imagesToDelete: [],
    });
  };

  // 수정 내용 변경 시 호출되는 함수
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  // 별점 변경 시 호출되는 함수
  const handleRatingChange = (newRating) => {
    setEditForm({
      ...editForm,
      rating: newRating,
    });
  };

  // 리뷰 수정 저장 함수
  const handleSaveEdit = async (reviewId) => {
    if (editForm.content.trim().length < 10) {
      showToast('리뷰는 최소 10자 이상 작성해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 변경사항이 있는지 확인
      const hasImageChanges = editForm.newImages.length > 0 || editForm.imagesToDelete.length > 0;

      if (hasImageChanges) {
        // FormData로 이미지와 함께 전송
        const formData = new FormData();
        formData.append('content', editForm.content);
        formData.append('rating', editForm.rating.toString());
        formData.append('serviceType', editForm.serviceType);
        formData.append('keepExistingImages', 'true');

        // 삭제할 이미지 ID들 추가
        editForm.imagesToDelete.forEach((imageId) => {
          formData.append('imagesToDelete', imageId);
        });

        // 새로운 이미지들 추가
        editForm.newImages.forEach((image) => {
          formData.append('images', image);
        });

        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: 'PATCH',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '리뷰 수정에 실패했습니다.');
        }
      } else {
        // 텍스트만 변경된 경우 JSON으로 전송
        const response = await fetch(`/api/reviews/${reviewId}`, {
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

      // 성공 메시지 표시
      showToast('리뷰가 성공적으로 수정되었습니다.', 'success');

      // 새 이미지 미리보기 URL들 정리
      editForm.newImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

      // 수정 모드 종료
      setEditingReview(null);

      // 리뷰 목록을 다시 조회하여 최신 데이터로 업데이트
      const response = await fetch(`/api/reviews/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserReviews(data.reviews || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
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
      // FormData 생성
      const formData = new FormData();
      formData.append('serviceType', serviceType);
      formData.append('rating', rating.toString());
      formData.append('content', reviewText);

      // 이미지 파일들 추가
      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      // 리뷰 API 호출
      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData, // FormData 사용
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

      // 파일 입력 필드 초기화
      const fileInput = document.getElementById('imageInput');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 서비스 유형에 따른 텍스트 변환 함수
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

  // 날짜 포맷 함수
  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 파일 크기 포맷 함수
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 토스트 메시지 컴포넌트  const Toast = () => {    if (!toast.visible || !toast.message) return null;    const isError = toast.type === 'error';    return (      <div        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300         ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}      >        <div          className={`py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium          ${isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}        >          {isError ? (            <svg              xmlns="http://www.w3.org/2000/svg"              className="h-5 w-5"              viewBox="0 0 20 20"              fill="currentColor"            >              <path                fillRule="evenodd"                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"                clipRule="evenodd"              />            </svg>          ) : (            <svg              xmlns="http://www.w3.org/2000/svg"              className="h-5 w-5"              viewBox="0 0 20 20"              fill="currentColor"            >              <path                fillRule="evenodd"                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"                clipRule="evenodd"              />            </svg>          )}          {toast.message}        </div>      </div>    );  };

  // 이미지 갤러리 모달 컴포넌트
  const ImageGalleryModal = () => {
    if (!isImageModalOpen || !currentImages.length) return null;

    const currentImage = currentImages[currentImageIndex];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        {/* 배경 클릭으로 모달 닫기 */}
        <div className="absolute inset-0" onClick={handleCloseImageModal} />

        {/* 모달 컨텐츠 */}
        <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4">
          {/* 닫기 버튼 */}
          <button
            onClick={handleCloseImageModal}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
          >
            <FiX size={24} />
          </button>

          {/* 이전 버튼 */}
          {currentImages.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {/* 다음 버튼 */}
          {currentImages.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {/* 이미지 */}
          <div className="relative max-w-full max-h-full">
            <img
              src={currentImage.url}
              alt={currentImage.originalName || `이미지 ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* 이미지 정보 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium">
                  {currentImageIndex + 1} / {currentImages.length}
                </div>
                <div className="text-xs opacity-80">{currentImage.originalName}</div>
                <div className="text-xs opacity-70">{formatFileSize(currentImage.size)}</div>
              </div>
            </div>
          </div>

          {/* 썸네일 네비게이션 (3개 이상일 때만 표시) */}
          {currentImages.length > 2 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-16">
              <div className="flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg max-w-xs overflow-x-auto">
                {currentImages.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? 'border-white'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`썸네일 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 키보드 단축키 안내 */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs px-3 py-2 rounded-lg">
            <div>← → 이미지 전환</div>
            <div>ESC 닫기</div>
          </div>
        </div>
      </div>
    );
  };

  // 이전 이미지로 이동
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  };

  // 다음 이미지로 이동
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
  };

  // 모달 닫기
  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  // 이미지 클릭 핸들러 (모달 열기)
  const handleImageClick = (images, clickedIndex) => {
    setCurrentImages(images);
    setCurrentImageIndex(clickedIndex);
    setIsImageModalOpen(true);
  };

  // 키보드 이벤트 핸들링
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isImageModalOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextImage();
          break;
        case 'Escape':
          e.preventDefault();
          handleCloseImageModal();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 모달이 열릴 때 body 스크롤 방지
    if (isImageModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isImageModalOpen]);

  if (isLoading) {
    return <div>리뷰 목록을 불러오는 중입니다...</div>;
  }

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

      {/* 이미지 갤러리 모달 */}
      <ImageGalleryModal />
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
            이미지 업로드 (최대 5장, 총 10MB 이하)
          </label>
          <input
            type="file"
            id="imageInput"
            multiple
            accept="image/jpeg,image/png,.jpg,.png"
            onChange={handleImageSelect}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">JPG, PNG 파일만 업로드 가능합니다.</p>
          {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}
        </div>

        {/* 이미지 미리보기 */}
        {selectedImages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              선택된 이미지 ({selectedImages.length}/5)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreviewUrls[index]}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <FiX />
                  </button>
                  <div className="mt-1 text-xs text-gray-500 truncate">{image.name}</div>
                  <div className="text-xs text-gray-400">{formatFileSize(image.size)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
      {/* 내가 작성한 리뷰 목록 */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          내가 작성한 리뷰
        </h3>

        {isLoading ? (
          <div className="py-6 text-center text-gray-500">리뷰 목록을 불러오는 중...</div>
        ) : userReviews.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-gray-400 mb-2">
              <FiStar size={40} className="mx-auto mb-2" />
            </div>
            <p className="text-gray-600">작성한 리뷰가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {editingReview === review.id ? (
                  // 수정 모드 UI
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <select
                        name="serviceType"
                        value={editForm.serviceType}
                        onChange={handleEditFormChange}
                        className="py-1 px-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="computer">컴퓨터</option>
                        <option value="printer">프린터</option>
                        <option value="notebook">노트북</option>
                        <option value="as">AS 서비스</option>
                        <option value="other">기타 서비스</option>
                      </select>
                      <span className="text-xs text-gray-500">
                        {formatReviewDate(review.createdAt)}
                      </span>
                    </div>
                    <div>
                        <option value="notebook">노트북</option>
                      <div className="flex items-center gap-1 mb-2">
                        <option value="other">기타 서비스</option>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="text-xl focus:outline-none"
                          >
                      <div className="flex items-center gap-1 mb-2">
                            <FiStar
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                          </button>
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="text-xl focus:outline-none"
                      <textarea
                        name="content"
                        value={editForm.content}
                        onChange={handleEditFormChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] text-sm"
                        rows={6}
                        ))}{' '}
                      <p className="mt-1 text-xs text-gray-500">
                      </div>{' '}
                      <textarea
                        name="content"
                        value={editForm.content}
                        onChange={handleEditFormChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] text-sm"
                        rows={6}
                      />{' '}
                      <p className="mt-1 text-xs text-gray-500">
                        {' '}
                        최소 10자 이상 작성해주세요. 현재 {editForm.content.length}자{' '}
                      </p>{' '}
                    </div>{' '}
                    {/* 이미지 관리 섹션 */}{' '}
                    <div className="space-y-3">
                      {' '}
                      {/* 기존 이미지들 */}{' '}
                      {editForm.existingImages && editForm.existingImages.length > 0 && (
                        <div>
                          {' '}
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            기존 이미지
                          </h5>{' '}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {' '}
                            {editForm.existingImages.map((image, index) => (
                              <div key={image.id || index} className="relative group">
                                {' '}
                                <div
                                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden ${editForm.imagesToDelete.includes(image.id) ? 'opacity-50 grayscale' : ''}`}
                                >
                                  {' '}
                                  <img
                                    src={image.url}
                                    alt={image.originalName || `이미지 ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />{' '}
                                </div>{' '}
                                {editForm.imagesToDelete.includes(image.id) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleExistingImageRestore(image.id)}
                                    className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-green-600 transition-colors"
                                    title="복원"
                                  >
                                    {' '}
                                    ↶{' '}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleExistingImageRemove(image.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                    title="삭제"
                                  >
                                    {' '}
                                    <FiX />{' '}
                                  </button>
                                )}{' '}
                                <div className="mt-1 text-xs text-gray-500 truncate">
                                  {' '}
                                  {image.originalName}{' '}
                                </div>{' '}
                                <div className="text-xs text-gray-400">
                                  {' '}
                                  {formatFileSize(image.size)}{' '}
                                </div>{' '}
                                {editForm.imagesToDelete.includes(image.id) && (
                                  <div className="text-xs text-red-500">삭제 예정</div>
                                )}{' '}
                              </div>
                            ))}{' '}
                          </div>{' '}
                        </div>
                      )}{' '}
                      {/* 새 이미지 추가 */}{' '}
                      <div>
                        {' '}
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {' '}
                          새 이미지 추가 (현재 총{' '}
                          {editForm.existingImages.length -
                            editForm.imagesToDelete.length +
                            editForm.newImages.length}
                          /5장){' '}
                        </label>{' '}
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,.jpg,.png"
                          onChange={handleEditImageSelect}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          disabled={
                            editForm.existingImages.length -
                              editForm.imagesToDelete.length +
                              editForm.newImages.length >=
                            5
                          }
                        />{' '}
                        <p className="mt-1 text-xs text-gray-500">
                          {' '}
                          JPG, PNG 파일만 업로드 가능합니다.{' '}
                        </p>{' '}
                      </div>{' '}
                      {/* 새로 추가된 이미지들 */}{' '}
                      {editForm.newImages.length > 0 && (
                        <div>
                          {' '}
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            새로 추가된 이미지
                          </h5>{' '}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {' '}
                            {editForm.newImages.map((image, index) => (
                              <div key={index} className="relative group">
                                {' '}
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  {' '}
                                  <img
                                    src={editForm.newImagePreviewUrls[index]}
                                    alt={`새 이미지 ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />{' '}
                                </div>{' '}
                                <button
                                  type="button"
                                  onClick={() => handleNewImageRemove(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                >
                                  {' '}
                                  <FiX />{' '}
                                </button>{' '}
                                <div className="mt-1 text-xs text-gray-500 truncate">
                                  {' '}
                                  {image.name}{' '}
                                </div>{' '}
                                <div className="text-xs text-gray-400">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="py-1.5 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleSaveEdit(review.id)}
                        disabled={isSubmitting}
                        className={`py-1.5 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs
                          ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                      >
                        {isSubmitting ? '저장 중...' : '저장하기'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // 일반 보기 모드 UI
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md mr-2">
                          {getServiceTypeText(review.serviceType)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatReviewDate(review.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">{review.rating}점</span>
                    </div>

                    <p className="text-gray-700 whitespace-pre-line text-sm mb-3">
                      {review.content}
                    </p>
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">{review.rating}점</span>
                    </div>

                    <p className="text-gray-700 whitespace-pre-line text-sm mb-3">
                      {review.content}
                    </p>

                    {/* 이미지 표시 */}
                    {review.images && review.images.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">첨부된 이미지</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {review.images.map((image, index) => (
                            <div key={image.id || index} className="relative group">
                              <div className="bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={image.url}
                                  alt={image.originalName || `이미지 ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => handleImageClick(review.images, index)}
                                />
                              </div>
                              <div className="mt-1 text-xs text-gray-500 truncate">
                                {image.originalName}

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleEditClick(review)}
                        className="py-1 px-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs flex items-center gap-1 mr-1"
                      >
                        <FiEdit size={12} /> 수정하기
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="py-1 px-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs flex items-center"
                      >
                        <MdDeleteForever size={12} /> 삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
