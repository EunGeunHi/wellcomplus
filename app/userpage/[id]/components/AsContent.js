'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiHelpCircle } from 'react-icons/fi';
import { FaTools } from 'react-icons/fa';
import { formatDate } from '@/utils/dateFormat';

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
          <button
            onClick={() => router.push('/userpage/application')}
            className="bg-indigo-600 text-white border-none rounded-md py-3 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-indigo-700"
          >
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
        <button
          onClick={() => router.push('/userpage/application')}
          className="bg-indigo-600 text-white border-none rounded-lg py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-indigo-700 flex items-center gap-1 sm:gap-2"
        >
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

export default AsContent;
