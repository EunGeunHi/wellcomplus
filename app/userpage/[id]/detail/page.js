'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiFileText,
  FiHelpCircle,
  FiClipboard,
  FiShoppingBag,
  FiSettings,
  FiCalendar,
  FiUser,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDownload,
  FiPaperclip,
} from 'react-icons/fi';
import { formatDate } from '@/utils/dateFormat';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

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
        console.log(data);
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
      case 'pending':
        return <FiClock className="text-indigo-500" />;
      case 'approved':
        return <FiCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '검토중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거절됨';
      default:
        return '처리중';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['NanumGothic'] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center">정보를 불러오는 중입니다...</div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['NanumGothic'] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center text-red-500">
            {error || '신청 정보를 찾을 수 없습니다.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoggedInOnlySection fallback={<LoginFallback />}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['NanumGothic'] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft size={20} />
              <span>돌아가기</span>
            </button>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                {application.type === 'computer'
                  ? '컴퓨터 견적'
                  : application.type === 'printer'
                    ? '프린터 견적'
                    : application.type === 'notebook'
                      ? '노트북 견적'
                      : application.type === 'as'
                        ? 'AS 신청'
                        : '기타 문의'}
              </h1>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  application.status
                )}`}
              >
                {getStatusIcon(application.status)}
                {getStatusText(application.status)}
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 상세 내용 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">상세 내용</h2>
              <div className="space-y-4">
                {application.type === 'computer' && application.computer_information && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-700">용도</h3>
                        <p className="text-gray-600">
                          {application.computer_information.purpose || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">예산</h3>
                        <p className="text-gray-600">
                          {application.computer_information.budget || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">요구사항</h3>
                        <p className="text-gray-600">
                          {application.computer_information.requirements || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">추가 요청사항</h3>
                        <p className="text-gray-600">
                          {application.computer_information.additional || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">기타</h3>
                        <p className="text-gray-600">
                          {application.computer_information.etc || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">연락처</h3>
                        <p className="text-gray-600">
                          {application.computer_information.phoneNumber || '-'}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <h3 className="font-medium text-gray-700">주소</h3>
                        <p className="text-gray-600">
                          {application.computer_information.address || '-'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {application.type === 'printer' && application.printer_information && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-700">모델명</h3>
                        <p className="text-gray-600">
                          {application.printer_information.modelName || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">용도</h3>
                        <p className="text-gray-600">
                          {application.printer_information.purpose || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">요구사항</h3>
                        <p className="text-gray-600">
                          {application.printer_information.requirements || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">수정사항</h3>
                        <p className="text-gray-600">
                          {application.printer_information.modification || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">추가 요청사항</h3>
                        <p className="text-gray-600">
                          {application.printer_information.additional || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">연락처</h3>
                        <p className="text-gray-600">
                          {application.printer_information.phoneNumber || '-'}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <h3 className="font-medium text-gray-700">주소</h3>
                        <p className="text-gray-600">
                          {application.printer_information.address || '-'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {application.type === 'notebook' && application.notebook_information && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-700">모델명</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.modelName || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">제조사</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.manufacturer || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">브랜드</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.brand || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">화면 크기</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.screenSize || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">CPU</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.cpuType || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">GPU</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.gpuType || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">RAM</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.ramSize || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">저장장치</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.storageSize || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">운영체제</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.os || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">무게</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.weight || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">가격대</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.priceRange || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">용도</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.purpose || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">연락처</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.phoneNumber || '-'}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <h3 className="font-medium text-gray-700">추가 요청사항</h3>
                        <p className="text-gray-600">
                          {application.notebook_information.additionalRequests || '-'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {application.type === 'as' && application.as_information && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-700">품목</h3>
                        <p className="text-gray-600">
                          {application.as_information.itemType || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">연락처</h3>
                        <p className="text-gray-600">
                          {application.as_information.phoneNumber || '-'}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <h3 className="font-medium text-gray-700">상세 설명</h3>
                        <p className="text-gray-600">
                          {application.as_information.description || '-'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {application.type === 'inquiry' && application.inquiry_information && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-700">제목</h3>
                        <p className="text-gray-600">
                          {application.inquiry_information.title || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">연락처</h3>
                        <p className="text-gray-600">
                          {application.inquiry_information.phoneNumber || '-'}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <h3 className="font-medium text-gray-700">내용</h3>
                        <p className="text-gray-600">
                          {application.inquiry_information.content || '-'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 파일 섹션 */}
            {application.files && application.files.length > 0 && (
              <div className="p-6 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiPaperclip className="mr-2" />
                  첨부 파일
                </h2>
                <div className="grid gap-3">
                  {application.files.map((file, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FiFileText className="text-indigo-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-gray-900 font-medium">{file.fileName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFileDownload(index)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <FiDownload className="mr-1" />
                        <span className="text-sm">다운로드</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 관리자 답변 섹션 */}
            {application.adminResponse && (
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">관리자 답변</h2>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiMessageSquare className="text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">관리자</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.adminResponse}</p>
                </div>
              </div>
            )}

            {/* 진행 상황 섹션 */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">진행 상황</h2>
              <div className="space-y-4">
                {application.progressHistory?.map((progress, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FiCheckCircle className="text-indigo-600" />
                      </div>
                      {index < application.progressHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-indigo-100"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{progress.status}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(progress.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{progress.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoggedInOnlySection>
  );
};

export default DetailPage;
