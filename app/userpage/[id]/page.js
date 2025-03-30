'use client';
import { useState, useEffect } from 'react';
import {
  FiUser,
  FiHeart,
  FiSettings,
  FiShoppingBag,
  FiMail,
  FiPhone,
  FiCalendar,
  FiEdit,
  FiLogOut,
  FiChevronRight,
  FiFileText,
  FiHelpCircle,
  FiClipboard,
} from 'react-icons/fi';
import { formatDate, getRelativeTime } from '@/utils/dateFormat';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

const UserPage = ({ params }) => {
  const [activeMenu, setActiveMenu] = useState('estimate');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // 실제 환경에서는 API 호출로 대체됩니다
    const mockUserData = {
      _id: params.id,
      name: '창준',
      email: 'kcj@c.com',
      phoneNumber: '010-1234-5678',
      authority: 'user',
      createdAt: '2025-03-29T08:57:15.091Z',
    };
    setUserData(mockUserData);
  }, [params.id]);

  const menuItems = [
    { id: 'profile', label: '프로필', icon: <FiUser /> },
    { id: 'estimate', label: '견적 신청 내역', icon: <FiFileText /> },
    { id: 'as', label: 'AS 및 문의 내역', icon: <FiHelpCircle /> },
    { id: 'settings', label: '설정', icon: <FiSettings /> },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return <ProfileContent userData={userData} />;
      case 'estimate':
        return <EstimateContent />;
      case 'as':
        return <AsContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <ProfileContent userData={userData} />;
    }
  };

  return (
    <LoggedInOnlySection fallback={<LoginFallback />}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['NanumGothic'] p-8">
        <div className="max-w-7xl mx-auto flex gap-8 flex-col md:flex-row">
          <div className="w-full md:w-80 flex flex-col gap-6">
            <nav className="bg-white rounded-2xl p-4 shadow-lg flex flex-col gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center justify-between p-4 w-full border-none rounded-lg text-base cursor-pointer transition-all duration-200 
                  ${
                    activeMenu === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
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
              <button className="flex items-center justify-center gap-3 mt-4 p-4 bg-white text-red-500 border border-red-100 rounded-lg text-base cursor-pointer transition-all duration-200 hover:bg-red-50">
                <FiLogOut size={18} />
                로그아웃
              </button>
            </nav>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <main className="bg-white rounded-2xl p-8 shadow-lg">{renderContent()}</main>
          </div>
        </div>
      </div>
    </LoggedInOnlySection>
  );
};

const ProfileContent = ({ userData }) => {
  if (!userData) return <div>로딩중...</div>;

  return (
    <>
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
          프로필
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-center text-lg text-indigo-600 bg-indigo-50 w-10 h-10 rounded-lg">
              <FiUser />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-0.5">이름</div>
              <div className="text-lg text-gray-900 font-semibold">{userData.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-center text-lg text-indigo-600 bg-indigo-50 w-10 h-10 rounded-lg">
              <FiMail />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-0.5">이메일</div>
              <div className="text-lg text-gray-900 font-semibold">{userData.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-center text-lg text-indigo-600 bg-indigo-50 w-10 h-10 rounded-lg">
              <FiPhone />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-0.5">전화번호</div>
              <div className="text-lg text-gray-900 font-semibold">{userData.phoneNumber}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-center text-lg text-indigo-600 bg-indigo-50 w-10 h-10 rounded-lg">
              <FiCalendar />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-0.5">가입일</div>
              <div className="text-lg text-gray-900 font-semibold">
                {formatDate(userData.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const EstimateContent = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
      견적 신청 내역
    </h2>
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 text-gray-500">
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

const AsContent = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
      AS 및 문의 내역
    </h2>
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 text-gray-500">
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

const SettingsContent = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.75 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-md">
      설정
    </h2>
    <div className="flex flex-col gap-8">
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">개인정보 설정</h3>
        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm mb-3">
          <div>
            <div className="text-sm font-medium text-gray-900 mb-0.5">이메일 수신 설정</div>
            <div className="text-xs text-gray-500">
              마케팅 및 프로모션 관련 이메일을 수신합니다.
            </div>
          </div>
          <div className="relative w-10 h-5 bg-gray-200 rounded-full cursor-pointer transition-all duration-300 hover:bg-gray-300">
            <div className="absolute w-4 h-4 bg-white rounded-full left-0.5 top-0.5 transition-all duration-300"></div>
          </div>
        </div>
        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
          <div>
            <div className="text-sm font-medium text-gray-900 mb-0.5">SMS 수신 설정</div>
            <div className="text-xs text-gray-500">마케팅 및 프로모션 관련 SMS를 수신합니다.</div>
          </div>
          <div className="relative w-10 h-5 bg-gray-200 rounded-full cursor-pointer transition-all duration-300 hover:bg-gray-300">
            <div className="absolute w-4 h-4 bg-white rounded-full left-0.5 top-0.5 transition-all duration-300"></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">보안 설정</h3>
        <button className="flex items-center gap-2 w-full py-3 px-4 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shadow-sm hover:bg-gray-50 hover:border-gray-300">
          <FiSettings size={16} />
          비밀번호 변경하기
        </button>
      </div>
    </div>
  </div>
);

export default UserPage;
