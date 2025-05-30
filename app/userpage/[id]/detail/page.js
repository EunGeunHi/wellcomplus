'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiFileText,
  FiHelpCircle,
  FiClipboard,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDownload,
  FiPaperclip,
  FiStar,
  FiInfo,
  FiAlertCircle,
  FiActivity,
  FiBarChart2,
} from 'react-icons/fi';
import { FaComputer } from 'react-icons/fa6';
import { FaLaptop, FaTools } from 'react-icons/fa';
import { AiFillPrinter } from 'react-icons/ai';
import { formatDate } from '@/utils/dateFormat';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';
import { motion } from 'framer-motion';
import ApplicationDetails from './components/ApplicationDetails';

// Helper 함수들을 컴포넌트 외부로 이동
const getStatusIcon = (status) => {
  switch (status) {
    case 'apply':
      return <FiClock className="text-indigo-500" />;
    case 'in_progress':
      return <FiActivity className="text-sky-500" />;
    case 'completed':
      return <FiCheckCircle className="text-emerald-500" />;
    case 'cancelled':
      return <FiXCircle className="text-rose-500" />;
    default:
      return <FiClock className="text-slate-500" />;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'apply':
      return '신청됨';
    case 'in_progress':
      return '진행중';
    case 'completed':
      return '완료됨';
    case 'cancelled':
      return '취소됨';
    default:
      return '처리중';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'apply':
      return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    case 'in_progress':
      return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};

const getStatusAccentColor = (status) => {
  switch (status) {
    case 'apply':
      return 'border-indigo-500';
    case 'in_progress':
      return 'border-sky-500';
    case 'completed':
      return 'border-emerald-500';
    case 'cancelled':
      return 'border-rose-500';
    default:
      return 'border-slate-500';
  }
};

const getApplicationIcon = (type) => {
  switch (type) {
    case 'computer':
      return <FaComputer className="text-indigo-600" size={25} />;
    case 'printer':
      return <AiFillPrinter className="text-indigo-600" size={25} />;
    case 'notebook':
      return <FaLaptop className="text-indigo-600" size={25} />;
    case 'as':
      return <FaTools className="text-indigo-500" size={25} />;
    case 'inquiry':
      return <FiHelpCircle className="text-indigo-600" size={25} />;
    default:
      return <FiClipboard className="text-indigo-500" size={25} />;
  }
};

const getApplicationTitle = (type) => {
  switch (type) {
    case 'computer':
      return '컴퓨터 견적';
    case 'printer':
      return '프린터 견적';
    case 'notebook':
      return '노트북 견적';
    case 'as':
      return 'A/S 신청';
    case 'inquiry':
      return '기타 문의';
    default:
      return '신청 정보';
  }
};

const DetailPage = () => {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 메모이제이션된 fetch 함수
  const fetchApplicationDetail = useCallback(async () => {
    if (!applicationId) {
      setError('신청 ID가 없습니다');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('신청 정보를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      if (!data) {
        throw new Error('신청 정보를 찾을 수 없습니다');
      }

      setApplication(data);
      setError(null);
    } catch (err) {
      console.error('신청 상세 정보를 가져오는 중 오류 발생:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplicationDetail();
  }, [fetchApplicationDetail]);

  // 파일 다운로드 함수 최적화
  const handleFileDownload = useCallback(
    async (fileIndex) => {
      try {
        const response = await fetch(`/api/applications/${applicationId}/file/${fileIndex}`);
        if (!response.ok) throw new Error('파일 다운로드에 실패했습니다');

        const blob = await response.blob();
        const fileName = application.files[fileIndex].originalName;

        // 파일 다운로드를 위한 임시 링크 생성
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('파일 다운로드 중 오류 발생:', error);
        alert('파일 다운로드에 실패했습니다.');
      }
    },
    [applicationId, application?.files]
  );

  // 메모이제이션된 상태 관련 함수들
  const statusInfo = useMemo(() => {
    if (!application) return null;

    return {
      icon: getStatusIcon(application.status),
      text: getStatusText(application.status),
      color: getStatusColor(application.status),
      accentColor: getStatusAccentColor(application.status),
    };
  }, [application?.status]);

  const applicationInfo = useMemo(() => {
    if (!application) return null;

    return {
      icon: getApplicationIcon(application.type),
      title: getApplicationTitle(application.type),
    };
  }, [application?.type]);

  // 파일 크기를 읽기 쉽게 변환하는 함수
  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }, []);

  const MotionCard = ({ children, className, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      className={className}
    >
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white font-['NanumGothic'] p-2 sm:p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 스켈레톤 */}
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-6">
              <div className="w-5 h-5 sm:w-5 sm:h-5 bg-indigo-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 sm:w-16 sm:h-4 bg-indigo-200 rounded animate-pulse"></div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-6 border-l-4 border-indigo-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-100 animate-pulse"></div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="w-20 h-3 sm:w-20 sm:h-3 bg-indigo-100 rounded animate-pulse"></div>
                    <div className="w-32 h-5 sm:w-32 sm:h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-40 h-3 sm:w-48 sm:h-3 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1 sm:space-y-2">
                  <div className="w-32 h-3 sm:w-32 sm:h-3 bg-gray-100 rounded animate-pulse"></div>
                  <div className="w-20 h-6 sm:w-20 sm:h-6 bg-indigo-100 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* 진행 상태 스켈레톤 */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="flex justify-around items-center max-w-3xl mx-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="w-10 h-2 sm:w-12 sm:h-2 bg-gray-100 rounded mt-1 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 콘텐츠 스켈레톤 */}
          <div className="space-y-3 sm:space-y-4">
            {/* 상세 내용 스켈레톤 */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-indigo-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 rounded animate-pulse"></div>
                <div className="w-20 h-4 sm:w-20 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-2 sm:p-2 border border-gray-200">
                    <div className="w-16 h-3 sm:w-16 sm:h-3 bg-gray-200 rounded mb-1 sm:mb-1 animate-pulse"></div>
                    <div className="w-24 h-3 sm:w-24 sm:h-3 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 파일 섹션 스켈레톤 */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-emerald-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded animate-pulse"></div>
                <div className="w-20 h-4 sm:w-20 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white p-3 sm:p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2 sm:mb-2">
                      <div className="w-8 h-8 sm:w-8 sm:h-8 bg-emerald-50 rounded mr-2 sm:mr-2 animate-pulse"></div>
                      <div className="w-20 h-3 sm:w-20 sm:h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-12 h-2 sm:w-12 sm:h-2 bg-gray-100 rounded mb-3 sm:mb-3 animate-pulse"></div>
                    <div className="w-full h-6 sm:h-6 bg-emerald-50 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white font-['NanumGothic'] p-2 sm:p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-8 text-center text-rose-500">
            <FiAlertCircle className="h-12 w-12 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4" />
            <p className="text-lg sm:text-lg font-medium">
              {error || '신청 정보를 찾을 수 없습니다.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoggedInOnlySection fallback={<LoginFallback />}>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-indigo-100/30 to-white font-['NanumGothic'] p-2 sm:p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 sm:mb-8"
          >
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 mb-3 sm:mb-6 font-medium text-sm sm:text-base"
            >
              <FiArrowLeft size={20} className="sm:w-5 sm:h-5" />
              <span>돌아가기</span>
            </button>

            <div
              className={`flex flex-col bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-6 border-l-4 ${statusInfo.accentColor}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
                    <div className="text-xl sm:text-2xl">{applicationInfo.icon}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-indigo-600 font-medium">신청 유형</div>
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {applicationInfo.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                      접수번호: {applicationId.substring(0, 24)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                    <FiCalendar className="text-gray-400" size={14} />
                    <span>신청일: {formatDate(application.createdAt)}</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm ${statusInfo.color}`}
                  >
                    <div className="text-sm sm:text-base">{statusInfo.icon}</div>
                    <span>{statusInfo.text}</span>
                  </div>
                </div>
              </div>

              {/* 상태 진행 표시 - 헤더 내부 */}
              <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="relative flex justify-around items-center max-w-3xl mx-auto">
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200"></div>

                  <div
                    className={`relative flex flex-col items-center z-10 ${application.status === 'apply' || application.status === 'in_progress' || application.status === 'completed' ? 'text-indigo-600' : 'text-slate-400'}`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${application.status === 'apply' || application.status === 'in_progress' || application.status === 'completed' ? 'bg-indigo-100' : 'bg-slate-100'}`}
                    >
                      <FiClock className="text-sm sm:text-lg" />
                    </div>
                    <span className="text-xs font-semibold mt-0.5 sm:mt-1">신청됨</span>
                  </div>

                  <div
                    className={`relative flex flex-col items-center z-10 ${application.status === 'in_progress' || application.status === 'completed' ? 'text-sky-600' : 'text-slate-400'}`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${application.status === 'in_progress' || application.status === 'completed' ? 'bg-sky-100' : 'bg-slate-100'}`}
                    >
                      <FiActivity className="text-sm sm:text-lg" />
                    </div>
                    <span className="text-xs font-semibold mt-0.5 sm:mt-1">진행중</span>
                  </div>

                  <div
                    className={`relative flex flex-col items-center z-10 ${application.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${application.status === 'completed' ? 'bg-emerald-100' : 'bg-slate-100'}`}
                    >
                      <FiCheckCircle className="text-sm sm:text-lg" />
                    </div>
                    <span className="text-xs font-semibold mt-0.5 sm:mt-1">완료됨</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 메인 컨텐츠 */}
          <div className="grid gap-3 sm:gap-4">
            {/* 관리자 코멘트 섹션 */}
            {application.comment && (
              <MotionCard
                className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-yellow-400"
                delay={0.2}
              >
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-1.5 bg-yellow-100 rounded-lg">
                    <FiStar className="text-yellow-600" size={16} />
                  </div>
                  <h2 className="text-lg sm:text-lg font-bold text-gray-900">관리자 안내</h2>
                </div>
                <div className="bg-yellow-50/50 rounded-lg p-3 sm:p-3 border border-yellow-100">
                  <p className="text-sm sm:text-sm text-gray-700 whitespace-pre-wrap">
                    {application.comment}
                  </p>
                </div>
              </MotionCard>
            )}

            {/* 상세 내용 섹션 */}
            <ApplicationDetails application={application} delay={0.3} />

            {/* 파일 섹션 */}
            {application.files && application.files.length > 0 && (
              <MotionCard
                className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-emerald-500"
                delay={0.4}
              >
                <div className="flex items-center gap-2 mb-3 sm:mb-3">
                  <div className="p-1.5 sm:p-1.5 bg-emerald-100 rounded-lg">
                    <FiPaperclip className="text-emerald-600" size={16} />
                  </div>
                  <h2 className="text-lg sm:text-lg font-bold text-gray-900">첨부 파일</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3">
                  {application.files.map((file, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-3 sm:p-3 rounded-lg flex flex-col border border-gray-200 hover:border-emerald-300 transition-colors shadow-sm h-full"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center mb-2 sm:mb-2">
                        <div className="p-2 sm:p-2 mr-2 sm:mr-2 bg-emerald-50 rounded-lg">
                          <FiFileText className="text-emerald-500" size={16} />
                        </div>
                        <div className="truncate flex-1">
                          <p
                            className="text-gray-900 font-medium text-sm sm:text-sm truncate"
                            title={file.originalName}
                          >
                            {file.originalName}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-xs text-gray-500 mb-3 sm:mb-3">
                        {formatFileSize(file.size)}
                      </p>

                      <motion.button
                        onClick={() => handleFileDownload(index)}
                        className="flex items-center justify-center gap-1 sm:gap-1 text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-2 sm:px-3 sm:py-2 rounded-lg transition-colors hover:bg-emerald-100 text-xs sm:text-xs mt-auto w-full font-medium"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <FiDownload className="text-sm sm:text-sm" />
                        <span>다운로드</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </MotionCard>
            )}

            {/* 참고 정보 섹션 */}
            <MotionCard
              className="bg-white/90 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-3 mt-1 sm:mt-2 border border-indigo-100"
              delay={0.5}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-xs text-gray-500 gap-1 sm:gap-0">
                <div className="flex items-center gap-1 sm:gap-1">
                  <FiInfo className="text-sm sm:text-xs" />
                  <span>접수 완료 후 담당자가 순차적으로 연락드립니다.</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1">
                  <FiBarChart2 className="text-sm sm:text-xs" />
                  <span>진행 상태: {statusInfo.text}</span>
                </div>
              </div>
            </MotionCard>
          </div>
        </div>
      </div>
    </LoggedInOnlySection>
  );
};

export default DetailPage;
