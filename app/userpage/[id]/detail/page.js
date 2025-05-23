'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiFileText,
  FiHelpCircle,
  FiClipboard,
  FiShoppingBag,
  FiCalendar,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDownload,
  FiPaperclip,
  FiStar,
  FiInfo,
  FiPhone,
  FiHome,
  FiMonitor,
  FiCpu,
  FiMaximize2,
  FiLayers,
  FiDollarSign,
  FiAlertCircle,
  FiActivity,
  FiBarChart2,
} from 'react-icons/fi';
import { FaComputer } from 'react-icons/fa6';
import { FaLaptop, FaTools } from 'react-icons/fa';
import { GoDatabase } from 'react-icons/go';
import { GrSystem } from 'react-icons/gr';
import { FaUserPen } from 'react-icons/fa6';
import { RiWeightFill } from 'react-icons/ri';
import { LuClipboardPlus } from 'react-icons/lu';
import { AiFillPrinter } from 'react-icons/ai';
import { MdPrecisionManufacturing, MdClass, MdOutlineSubtitles } from 'react-icons/md';

import { formatDate } from '@/utils/dateFormat';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';
import { motion } from 'framer-motion';

const DetailPage = () => {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicationDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/applications/${applicationId}`);
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
    };

    if (applicationId) {
      fetchApplicationDetail();
    } else {
      setError('신청 ID가 없습니다');
      setLoading(false);
    }
  }, [applicationId]);

  // 파일 다운로드 함수
  const handleFileDownload = async (fileIndex) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/file/${fileIndex}`);
      if (!response.ok) throw new Error('파일 다운로드에 실패했습니다');

      const blob = await response.blob();
      const fileName = application.files[fileIndex].fileName;

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
  };

  // 파일 크기를 읽기 쉽게 변환하는 함수
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

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
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white font-['NanumGothic'] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-indigo-100 h-16 w-16 flex items-center justify-center mb-4">
                <FiClock className="h-8 w-8 text-indigo-300" />
              </div>
              <div className="h-4 bg-indigo-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-indigo-50 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white font-['NanumGothic'] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center text-rose-500">
            <FiAlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error || '신청 정보를 찾을 수 없습니다.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoggedInOnlySection fallback={<LoginFallback />}>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-indigo-100/30 to-white font-['NanumGothic'] p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 mb-6 font-medium"
            >
              <FiArrowLeft size={20} />
              <span>돌아가기</span>
            </button>

            <div
              className={`flex flex-col bg-white rounded-xl shadow-md p-6 border-l-4 ${getStatusAccentColor(application.status)}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
                    {getApplicationIcon(application.type)}
                  </div>
                  <div>
                    <div className="text-sm text-indigo-600 font-medium">신청 유형</div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {getApplicationTitle(application.type)}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      접수번호: {applicationId.substring(0, 24)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FiCalendar className="text-gray-400" size={14} />
                    <span>신청일: {formatDate(application.createdAt)}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getStatusColor(application.status)}`}
                  >
                    {getStatusIcon(application.status)}
                    <span>{getStatusText(application.status)}</span>
                  </div>
                </div>
              </div>

              {/* 상태 진행 표시 - 헤더 내부 */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="relative flex justify-around items-center max-w-3xl mx-auto">
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200"></div>

                  <div
                    className={`relative flex flex-col items-center z-10 ${application.status === 'apply' || application.status === 'in_progress' || application.status === 'completed' ? 'text-indigo-600' : 'text-slate-400'}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${application.status === 'apply' || application.status === 'in_progress' || application.status === 'completed' ? 'bg-indigo-100' : 'bg-slate-100'}`}
                    >
                      <FiClock size={18} />
                    </div>
                    <span className="text-xs font-semibold mt-1">신청됨</span>
                  </div>

                  <div
                    className={`relative flex flex-col items-center z-10 ${application.status === 'in_progress' || application.status === 'completed' ? 'text-sky-600' : 'text-slate-400'}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${application.status === 'in_progress' || application.status === 'completed' ? 'bg-sky-100' : 'bg-slate-100'}`}
                    >
                      <FiActivity size={18} />
                    </div>
                    <span className="text-xs font-semibold mt-1">진행중</span>
                  </div>

                  <div
                    className={`relative flex flex-col items-center z-10 ${application.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${application.status === 'completed' ? 'bg-emerald-100' : 'bg-slate-100'}`}
                    >
                      <FiCheckCircle size={18} />
                    </div>
                    <span className="text-xs font-semibold mt-1">완료됨</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 메인 컨텐츠 */}
          <div className="grid gap-4">
            {/* 관리자 코멘트 섹션 */}
            {application.comment && (
              <MotionCard
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-400"
                delay={0.2}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-yellow-100 rounded-lg">
                    <FiStar className="text-yellow-600" size={16} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">관리자 안내</h2>
                </div>
                <div className="bg-yellow-50/50 rounded-lg p-3 border border-yellow-100">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{application.comment}</p>
                </div>
              </MotionCard>
            )}

            {/* 상세 내용 섹션 */}
            <MotionCard
              className="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-500"
              delay={0.3}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <FiInfo className="text-indigo-600" size={16} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">상세 내용</h2>
              </div>

              <div className="space-y-4">
                {application.type === 'computer' && application.computer_information && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FaUserPen className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">용도</h3>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {application.computer_information.purpose || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiDollarSign className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">예산</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.budget || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiCpu className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">CPU</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.cpu || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiMonitor className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">GPU</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.gpu || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiLayers className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">메모리</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.memory || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <GoDatabase className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">저장장치</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.storage || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiActivity className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">쿨러</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.cooling || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <GrSystem className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">운영체제</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.os || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiPhone className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">연락처</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.phoneNumber || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiShoppingBag className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">수령방법</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.computer_information.deliveryMethod || '-'}
                      </p>
                    </motion.div>

                    {application.computer_information.address && (
                      <motion.div
                        className="col-span-2 md:col-span-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.01,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FiHome className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">주소</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.computer_information.address || '-'}
                        </p>
                      </motion.div>
                    )}

                    {application.computer_information.additionalRequests && (
                      <motion.div
                        className="col-span-2 md:col-span-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.01,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <LuClipboardPlus className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">추가 요청사항</h3>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                          {application.computer_information.additionalRequests || '-'}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {application.type === 'printer' && application.printer_information && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FaUserPen className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">용도</h3>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {application.printer_information.purpose || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiDollarSign className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">예산</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.printer_information.budget || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <AiFillPrinter className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">프린터 종류</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.printer_information.printerType || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiActivity className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">무한잉크젯</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.printer_information.infiniteInk || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiMonitor className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">출력색상</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.printer_information.outputColor || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiPhone className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">연락처</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.printer_information.phoneNumber || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiShoppingBag className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">수령방법</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.printer_information.deliveryMethod || '-'}
                      </p>
                    </motion.div>

                    {application.printer_information.address && (
                      <motion.div
                        className="col-span-2 md:col-span-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.01,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FiHome className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">주소</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.printer_information.address || '-'}
                        </p>
                      </motion.div>
                    )}

                    {application.printer_information.additionalRequests && (
                      <motion.div
                        className="col-span-2 md:col-span-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.01,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <LuClipboardPlus className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">추가 요청사항</h3>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                          {application.printer_information.additionalRequests || '-'}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {application.type === 'notebook' && application.notebook_information && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FaUserPen className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">용도</h3>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {application.notebook_information.purpose || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiDollarSign className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">예산</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.budget || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiCpu className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">CPU</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.cpu || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiMonitor className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">GPU</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.gpu || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <RiWeightFill className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">무게</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.weight || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <GrSystem className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">운영체제</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.os || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiLayers className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">RAM</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.ram || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <GoDatabase className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">저장장치</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.storage || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiPhone className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">연락처</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.phoneNumber || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiShoppingBag className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">수령방법</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.notebook_information.deliveryMethod || '-'}
                      </p>
                    </motion.div>

                    {application.notebook_information.address && (
                      <motion.div
                        className="col-span-2 md:col-span-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.01,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FiHome className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">주소</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.notebook_information.address || '-'}
                        </p>
                      </motion.div>
                    )}

                    {application.notebook_information.additionalRequests && (
                      <motion.div
                        className="col-span-2 md:col-span-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.01,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <LuClipboardPlus className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">추가 요청사항</h3>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                          {application.notebook_information.additionalRequests || '-'}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {application.type === 'as' && application.as_information && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <MdClass className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">A/S 분류</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.as_information.asCategory || '-'}
                      </p>
                    </motion.div>

                    {application.as_information.userName && (
                      <motion.div
                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.02,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FaUserPen className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">사용자 이름</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.as_information.userName || '-'}
                        </p>
                      </motion.div>
                    )}

                    {application.as_information.pcNumber && (
                      <motion.div
                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.02,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FiFileText className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">PC 번호</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.as_information.pcNumber || '-'}
                        </p>
                      </motion.div>
                    )}

                    {application.as_information.printerType && (
                      <motion.div
                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.02,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <AiFillPrinter className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">프린터 종류</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.as_information.printerType || '-'}
                        </p>
                      </motion.div>
                    )}

                    {application.as_information.infiniteInk && (
                      <motion.div
                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.02,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FiActivity className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">무한잉크젯</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.as_information.infiniteInk || '-'}
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiPhone className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">연락처</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.as_information.phoneNumber || '-'}
                      </p>
                    </motion.div>

                    {application.as_information.deliveryMethod && (
                      <motion.div
                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.02,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FiShoppingBag className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">수령방법</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.as_information.deliveryMethod || '-'}
                        </p>
                      </motion.div>
                    )}

                    {application.as_information.address && (
                      <motion.div
                        className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                        whileHover={{
                          scale: 1.01,
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FiHome className="text-slate-500" size={14} />
                          <h3 className="font-semibold text-gray-800 text-sm">주소</h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {application.as_information.address || '-'}
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.01,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiMessageSquare className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">상세 설명</h3>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {application.as_information.description || '-'}
                      </p>
                    </motion.div>
                  </div>
                )}

                {application.type === 'inquiry' && application.inquiry_information && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <MdOutlineSubtitles className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">제목</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.inquiry_information.title || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiPhone className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">연락처</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {application.inquiry_information.phoneNumber || '-'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm"
                      whileHover={{
                        scale: 1.01,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiMessageSquare className="text-slate-500" size={14} />
                        <h3 className="font-semibold text-gray-800 text-sm">내용</h3>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {application.inquiry_information.content || '-'}
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>
            </MotionCard>

            {/* 파일 섹션 */}
            {application.files && application.files.length > 0 && (
              <MotionCard
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-emerald-500"
                delay={0.4}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <FiPaperclip className="text-emerald-600" size={16} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">첨부 파일</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {application.files.map((file, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-3 rounded-lg flex flex-col border border-gray-200 hover:border-emerald-300 transition-colors shadow-sm h-full"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="p-2 mr-2 bg-emerald-50 rounded-lg">
                          <FiFileText className="text-emerald-500" size={18} />
                        </div>
                        <div className="truncate flex-1">
                          <p
                            className="text-gray-900 font-medium text-sm truncate"
                            title={file.fileName}
                          >
                            {file.fileName}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-3">{formatFileSize(file.fileSize)}</p>

                      <motion.button
                        onClick={() => handleFileDownload(index)}
                        className="flex items-center justify-center gap-1 text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg transition-colors hover:bg-emerald-100 text-xs mt-auto w-full"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <FiDownload size={14} />
                        <span className="font-medium">다운로드</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </MotionCard>
            )}

            {/* 참고 정보 섹션 */}
            <MotionCard
              className="bg-white/90 rounded-xl shadow-sm p-3 mt-2 border border-indigo-100"
              delay={0.5}
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FiInfo size={12} />
                  <span>접수 완료 후 담당자가 순차적으로 연락드립니다.</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiBarChart2 size={12} />
                  <span>진행 상태: {getStatusText(application.status)}</span>
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
