'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  FiAlertTriangle,
} from 'react-icons/fi';
import { FaComputer } from 'react-icons/fa6';
import { AiFillPrinter } from 'react-icons/ai';
import { FaLaptop, FaTools } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';

import { formatDate } from '@/utils/dateFormat';
import { formatKoreanPhoneNumber, isValidPhoneNumber } from '@/utils/phoneFormatter';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';
import ReviewUploadProgress from '@/app/components/ReviewUploadProgress';
import OptimizedReviewList from '@/app/components/OptimizedReviewList';
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
        return <ProfileContent userData={userData} onUserUpdate={setUserData} />;
      case 'estimate':
        return <EstimateContent userData={userData} userId={params.id} />;
      case 'as':
        return <AsContent userData={userData} userId={params.id} />;
      case 'review':
        return <ReviewContent userData={userData} userId={params.id} />;
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

const ProfileContent = ({ userData, onUserUpdate }) => {
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
  const [isNameChanged, setIsNameChanged] = useState(false);

  // 폼 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
      });
      setIsNameChanged(false);
    }
  }, [user]);

  // 이름 중복 체크 함수 (제거 - 서버에서 통합 처리)

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

    // 이름 길이 검사
    if (formData.name.length > 15) {
      setError('이름은 15자 이하여야 합니다.');
      setIsNameValid(false);
      return;
    }

    // 중복 확인 로직 제거 (서버에서 통합 처리)

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

      // 통합된 API 응답에서 세션 정보 사용하여 세션 갱신
      if (data.sessionUser) {
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

      // 로컬 상태 업데이트 (페이지 새로고침 대신)
      const updatedUserData = {
        ...userData,
        user: {
          ...userData.user,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        },
      };

      // 부모 컴포넌트의 상태 업데이트
      if (onUserUpdate) {
        onUserUpdate(updatedUserData);
      }

      // 1초 후 모달 닫기 (페이지 새로고침 제거)
      setTimeout(() => {
        setIsModalOpen(false);
        // 성공 메시지 초기화
        setSuccess('');
        setError('');
        // 이름 변경 상태 초기화
        setIsNameChanged(false);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 갱신 함수 제거 (통합된 API에서 처리)

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
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isPhoneValid || !isNameValid}
                  className={`flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center
                    ${
                      isLoading || !isPhoneValid || !isNameValid
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

  // OptimizedReviewList의 새로고침 함수에 접근하기 위한 ref
  const reviewListRefreshRef = useRef(null);

  // 리뷰 삭제 확인 모달 상태
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // 리뷰 편집 관련 상태는 OptimizedReviewList 컴포넌트에서 처리됨

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

  // 기존 리뷰 로딩 로직 제거 - OptimizedReviewList에서 처리

  // 컴포넌트가 언마운트될 때 타이머 정리
  useEffect(() => {
    return () => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
    };
  }, [toast.timerId]);

  // 리뷰 편집 관련 함수들은 OptimizedReviewList 컴포넌트에서 처리됨

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

  // 서비스 유형 변환 및 날짜 포맷 함수들은 OptimizedReviewList 컴포넌트에서 처리됨

  // 파일 크기 포맷 함수
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 토스트 메시지 컴포넌트  const Toast = () => {    if (!toast.visible || !toast.message) return null;    const isError = toast.type === 'error';    return (      <div        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300         ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}      >        <div          className={`py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium          ${isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}        >          {isError ? (            <svg              xmlns="http://www.w3.org/2000/svg"              className="h-5 w-5"              viewBox="0 0 20 20"              fill="currentColor"            >              <path                fillRule="evenodd"                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"                clipRule="evenodd"              />            </svg>          ) : (            <svg              xmlns="http://www.w3.org/2000/svg"              className="h-5 w-5"              viewBox="0 0 20 20"              fill="currentColor"            >              <path                fillRule="evenodd"                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"                clipRule="evenodd"              />            </svg>          )}          {toast.message}        </div>      </div>    );  };

  // 이미지 갤러리 모달 관련 코드는 OptimizedReviewList 컴포넌트에서 처리됨

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

export default UserPage;
