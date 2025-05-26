'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiCalendar,
  FiPhone,
  FiRefreshCw,
  FiInfo,
  FiMail,
  FiX,
  FiFile,
  FiUpload,
  FiTrash2,
  FiDownload,
  FiAlertCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { formatDate } from '@/utils/dateFormat';
import KingFallback from '@/app/components/kingFallback';

// 서비스 유형에 따른 아이콘과 텍스트
const serviceTypeInfo = {
  computer: { icon: '🖥️', text: '컴퓨터 견적' },
  printer: { icon: '🖨️', text: '프린터 견적' },
  notebook: { icon: '💻', text: '노트북 견적' },
  as: { icon: '🔧', text: 'AS 서비스' },
  inquiry: { icon: '❓', text: '기타 문의' },
};

// 상태에 따른 배지 스타일
const statusBadgeStyle = {
  apply: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  in_progress: 'bg-blue-100 text-blue-700 border border-blue-200',
  completed: 'bg-green-100 text-green-700 border border-green-200',
  cancelled: 'bg-red-100 text-red-700 border border-red-200',
};

// 상태에 따른 한글 텍스트
const statusText = {
  apply: '신청됨',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
};

// 파일 크기를 읽기 쉽게 변환하는 함수
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
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
          <FiCheckCircle className="text-white" />
        ) : (
          <FiAlertCircle className="text-white" />
        )}
        {message}
      </div>
    </div>
  );
}

export default function ServiceManagementPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('apply');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFileDeleteModal, setShowFileDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // 탭 메뉴 정의
  const tabs = [
    { id: 'apply', label: '신청됨', icon: <FiPackage /> },
    { id: 'in_progress', label: '진행중', icon: <FiClock /> },
    { id: 'completed', label: '완료', icon: <FiCheckCircle /> },
    { id: 'cancelled', label: '취소', icon: <FiXCircle /> },
  ];

  // 데이터 로드 함수
  const fetchApplications = async (status, search = searchQuery, type = serviceTypeFilter) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedApp(null);
      setUpdateSuccess('');
      setUpdateError('');
      setIsSearching(!!search || !!type);

      // URL 파라미터 구성
      const params = new URLSearchParams();
      params.append('status', status);
      if (search) params.append('search', search);
      if (type) params.append('type', type);

      const response = await fetch(`/api/service?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('서비스 신청 데이터 로드 중 오류:', err);
      setError(err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행 함수
  const handleSearch = (e) => {
    e.preventDefault();
    fetchApplications(activeTab);
  };

  // 검색 초기화 함수
  const clearSearch = () => {
    setSearchQuery('');
    setServiceTypeFilter('');
    fetchApplications(activeTab, '', '');
  };

  // 토스트 메시지 표시 함수
  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      setUpdateSuccess(message);
      setUpdateError('');
    } else {
      setUpdateError(message);
      setUpdateSuccess('');
    }
    setToastVisible(true);

    // 2초 후에 토스트 메시지 숨기기
    setTimeout(() => {
      setToastVisible(false);

      // 토스트가 사라진 후 메시지 초기화
      setTimeout(() => {
        setUpdateSuccess('');
        setUpdateError('');
      }, 300); // 페이드 아웃 애니메이션 시간
    }, 2000);
  };

  // 상태 변경 함수
  const handleStatusChange = async (id, newStatus) => {
    if (!id || !newStatus) return;

    try {
      setUpdateLoading(true);

      const response = await fetch('/api/service/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          comment: selectedApp.comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '상태 변경에 실패했습니다.');
      }

      const data = await response.json();

      // 현재 선택된 앱 정보 업데이트
      setSelectedApp({
        ...selectedApp,
        status: newStatus,
        updatedAt: data.application.updatedAt,
      });

      // 목록 새로고침
      await fetchApplications(activeTab);

      // 성공 메시지 표시
      showToast(`상태가 '${statusText[newStatus]}'으로 변경되었습니다.`, 'success');
    } catch (err) {
      console.error('상태 변경 중 오류:', err);
      showToast(err.message, 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  // 메모 업데이트 함수
  const handleCommentUpdate = async (id, comment) => {
    if (!id) return;

    try {
      setUpdateLoading(true);

      const response = await fetch('/api/service/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: selectedApp.status, // 상태 유지
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '메모 업데이트에 실패했습니다.');
      }

      // 성공 메시지 표시
      showToast('메모가 성공적으로 저장되었습니다.', 'success');
    } catch (err) {
      console.error('메모 업데이트 중 오류:', err);
      showToast(err.message, 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  // 파일 다운로드 함수
  const handleFileDownload = async (fileId) => {
    if (!selectedApp?.id || fileId === undefined || fileId === null) return;

    try {
      setUpdateLoading(true);

      const response = await fetch(`/api/service/files/${selectedApp.id}/${fileId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 다운로드에 실패했습니다.');
      }

      const blob = await response.blob();

      // 선택된 파일의 원본 파일명 사용
      let filename = selectedApp.files[fileId]?.originalName || 'download';

      // 브라우저 다운로드 트리거
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // 성공 메시지 표시
      showToast('파일 다운로드가 완료되었습니다.', 'success');
    } catch (err) {
      console.error('파일 다운로드 중 오류:', err);
      showToast(err.message, 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  // 파일 업로드 함수
  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!selectedApp?.id || !selectedFiles.length) return;

    try {
      setFileUploadLoading(true);

      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }

      const response = await fetch(`/api/service/files/${selectedApp.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 업로드에 실패했습니다.');
      }

      // 성공적으로 업로드된 경우, 선택된 앱 정보 업데이트
      const data = await response.json();
      setSelectedApp({
        ...selectedApp,
        files: data.files,
      });

      // 파일 선택 초기화
      setSelectedFiles([]);

      // 성공 메시지 표시
      showToast('파일이 성공적으로 업로드되었습니다.', 'success');
    } catch (err) {
      console.error('파일 업로드 중 오류:', err);
      showToast(err.message, 'error');
    } finally {
      setFileUploadLoading(false);
    }
  };

  // 파일 삭제 확인 모달 열기
  const handleFileDeleteClick = (fileId, fileName) => {
    setFileToDelete({ id: fileId, name: fileName });
    setShowFileDeleteModal(true);
  };

  // 파일 삭제 함수
  const handleFileDelete = async () => {
    if (
      !selectedApp?.id ||
      !fileToDelete ||
      fileToDelete.id === undefined ||
      fileToDelete.id === null
    )
      return;

    try {
      setUpdateLoading(true);

      const response = await fetch(`/api/service/files/${selectedApp.id}/${fileToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 삭제에 실패했습니다.');
      }

      // 삭제된 파일을 제외한 나머지 파일 목록으로 업데이트
      const data = await response.json();
      setSelectedApp({
        ...selectedApp,
        files: data.files,
      });

      // 모달 닫기
      setShowFileDeleteModal(false);
      setFileToDelete(null);

      // 성공 메시지 표시
      showToast('파일이 성공적으로 삭제되었습니다.', 'success');
    } catch (err) {
      console.error('파일 삭제 중 오류:', err);
      showToast(err.message, 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  // 애플리케이션 완전 삭제 함수
  const handleApplicationDelete = async () => {
    if (!selectedApp?.id) return;

    try {
      setDeleteLoading(true);

      const response = await fetch(`/api/service/delete/${selectedApp.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제에 실패했습니다.');
      }

      // 성공 메시지 표시
      showToast('서비스 신청이 완전히 삭제되었습니다.', 'success');

      // 모달 닫기
      setShowDeleteModal(false);

      // 선택된 앱 초기화
      setSelectedApp(null);

      // 목록 새로고침
      await fetchApplications(activeTab);
    } catch (err) {
      console.error('애플리케이션 삭제 중 오류:', err);
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 탭 변경 시 해당 상태의 데이터 로드
  useEffect(() => {
    if (status === 'authenticated') {
      fetchApplications(activeTab);
    }
  }, [activeTab, status]);

  // 항목 선택 처리 함수
  const handleItemSelect = (app) => {
    setSelectedApp(app);
    setUpdateError('');
    setUpdateSuccess('');
  };

  // 상태 변경 버튼 렌더링
  const renderStatusChangeButtons = (app) => {
    const buttons = [];

    // 현재 상태에 따라 다른 버튼을 표시
    switch (app.status) {
      case 'apply':
        buttons.push(
          {
            status: 'in_progress',
            label: '진행 중으로 변경',
            style: 'bg-blue-600 hover:bg-blue-700',
          },
          { status: 'cancelled', label: '취소로 변경', style: 'bg-red-600 hover:bg-red-700' }
        );
        break;

      case 'in_progress':
        buttons.push(
          { status: 'completed', label: '완료로 변경', style: 'bg-green-600 hover:bg-green-700' },
          { status: 'cancelled', label: '취소로 변경', style: 'bg-red-600 hover:bg-red-700' }
        );
        break;

      case 'completed':
        buttons.push({
          status: 'in_progress',
          label: '진행 중으로 변경',
          style: 'bg-blue-600 hover:bg-blue-700',
        });
        break;

      case 'cancelled':
        buttons.push(
          { status: 'apply', label: '신청으로 변경', style: 'bg-indigo-600 hover:bg-indigo-700' },
          {
            status: 'in_progress',
            label: '진행 중으로 변경',
            style: 'bg-blue-600 hover:bg-blue-700',
          }
        );
        break;

      default:
        break;
    }

    return buttons.map((button, index) => (
      <button
        key={index}
        onClick={() => handleStatusChange(app.id, button.status)}
        disabled={updateLoading}
        className={`px-4 py-2 text-white rounded-md ${button.style} transition-colors ${
          updateLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {button.label}
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
        message={updateSuccess || updateError}
        type={updateSuccess ? 'success' : 'error'}
        visible={toastVisible && (!!updateSuccess || !!updateError)}
        onClose={() => setToastVisible(false)}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* 헤더 */}
          <header className="bg-white shadow-sm rounded-lg p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">서비스 신청 관리</h1>
            <p className="text-gray-600 mt-2 mb-4">고객의 서비스 신청 내역을 관리할 수 있습니다.</p>

            {/* 검색 및 필터 */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="이름, 이메일, 전화번호로 검색..."
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
                  검색
                </button>
              </form>

              <div className="flex gap-2">
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => {
                    setServiceTypeFilter(e.target.value);
                    fetchApplications(activeTab, searchQuery, e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">모든 유형</option>
                  <option value="computer">컴퓨터 견적</option>
                  <option value="printer">프린터 견적</option>
                  <option value="notebook">노트북 견적</option>
                  <option value="as">AS 서비스</option>
                  <option value="inquiry">기타 문의</option>
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
          <div className="flex flex-col md:flex-row gap-3">
            {/* 신청 목록 */}
            <div className="md:w-1/4 bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find((tab) => tab.id === activeTab)?.label} 목록
                  {isSearching && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      {applications.length > 0
                        ? `검색 결과: ${applications.length}건`
                        : '검색 결과 없음'}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => fetchApplications(activeTab)}
                  className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                  title="새로고침"
                >
                  <FiRefreshCw />
                </button>
              </div>

              {isSearching && applications.length === 0 && !loading && !error ? (
                <div className="py-32 text-center">
                  <div className="text-gray-400 text-4xl mb-4">🔍</div>
                  <p className="text-gray-600 mb-2">검색 결과가 없습니다</p>
                  <p className="text-gray-500 text-sm mb-4">
                    다른 검색어나 필터 조건을 사용해보세요
                  </p>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    검색 초기화
                  </button>
                </div>
              ) : loading ? (
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
                    onClick={() => fetchApplications(activeTab)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : applications.length === 0 ? (
                <div className="py-32 text-center">
                  <div className="text-gray-400 text-4xl mb-4">📭</div>
                  <p className="text-gray-600 mb-2">데이터가 없습니다</p>
                  <p className="text-gray-500 text-sm">
                    {activeTab === 'apply' && '신청된 서비스 요청이 없습니다.'}
                    {activeTab === 'in_progress' && '진행 중인 서비스 요청이 없습니다.'}
                    {activeTab === 'completed' && '완료된 서비스 요청이 없습니다.'}
                    {activeTab === 'cancelled' && '취소된 서비스 요청이 없습니다.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleItemSelect(app)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedApp?.id === app.id
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">
                            {serviceTypeInfo[app.type]?.icon || '📋'}
                          </span>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {serviceTypeInfo[app.type]?.text || app.type}
                            </h3>
                            <p className="text-sm text-gray-600">{app.user.name}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusBadgeStyle[app.status]}`}
                        >
                          {statusText[app.status]}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <FiCalendar className="mr-1" />
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 상세 정보 */}
            <div className="md:w-3/4 bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">상세 정보</h2>

              {selectedApp ? (
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">기본 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiInfo size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">서비스 유형</p>
                          <p className="font-medium">
                            {serviceTypeInfo[selectedApp.type]?.text || selectedApp.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiUser size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">신청자</p>
                          <p className="font-medium">{selectedApp.user.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiMail size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">이메일</p>
                          <p className="font-medium overflow-hidden text-ellipsis">
                            {selectedApp.user.email || '정보 없음'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-2">
                          <FiPhone size={18} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-500">연락처</p>
                          <p className="font-medium">
                            {selectedApp.information?.phoneNumber ||
                              selectedApp.user.phoneNumber ||
                              '정보 없음'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 신청 정보 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">신청 정보</h3>
                    <div className="space-y-3">{renderApplicationDetails(selectedApp)}</div>
                  </div>

                  {/* 첨부 파일 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">첨부 파일</h3>

                    {/* 파일 목록 */}
                    <div className="mb-4">
                      {selectedApp.files && selectedApp.files.length > 0 ? (
                        <div className="space-y-2">
                          {selectedApp.files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                            >
                              <div className="flex items-center overflow-hidden">
                                <FiFile className="text-indigo-500 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700 truncate">
                                  {file.originalName} ({formatFileSize(file.size)})
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleFileDownload(index)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md"
                                  title="다운로드"
                                  disabled={updateLoading}
                                >
                                  <FiDownload size={18} />
                                </button>
                                <button
                                  onClick={() => handleFileDeleteClick(index, file.originalName)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                                  title="삭제"
                                  disabled={updateLoading}
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">첨부된 파일이 없습니다.</p>
                      )}
                    </div>

                    {/* 파일 업로드 폼 */}
                    <form onSubmit={handleFileUpload} className="mt-4">
                      <div className="flex flex-col">
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer py-3 px-4 border border-dashed border-gray-300 rounded-md text-center hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col items-center">
                            <FiUpload className="text-indigo-500 mb-2" size={20} />
                            <span className="text-sm text-gray-700">
                              여기를 클릭해 파일을 업로드하세요 (총 파일 크기 최대 2MB)
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {selectedFiles.length > 0
                                ? `${selectedFiles.length}개 파일 선택됨`
                                : ''}
                            </span>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                            className="hidden"
                            disabled={fileUploadLoading}
                          />
                        </label>

                        {selectedFiles.length > 0 && (
                          <div className="mt-3 flex justify-between items-center">
                            <button
                              type="button"
                              onClick={() => setSelectedFiles([])}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              선택 취소
                            </button>
                            <button
                              type="submit"
                              className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center ${
                                fileUploadLoading ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                              disabled={fileUploadLoading}
                            >
                              {fileUploadLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  업로드 중...
                                </>
                              ) : (
                                <>
                                  <FiUpload className="mr-2" size={16} />
                                  파일 업로드
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* 관리자 메모 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">관리자 메모</h3>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none h-32"
                      placeholder="관리자 메모를 입력하세요..."
                      value={selectedApp.comment || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, comment: e.target.value })}
                    ></textarea>
                    {/* 메모 및 상태 변경 저장 버튼 */}
                    <div className="mt-1 flex justify-end">
                      <button
                        onClick={() => handleCommentUpdate(selectedApp.id, selectedApp.comment)}
                        disabled={updateLoading}
                        className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center ${
                          updateLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {updateLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            저장 중...
                          </>
                        ) : (
                          '메모 저장하기 및 상태표시'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 상태 변경 버튼 */}
                  <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-4 rounded-lg mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mr-4 flex-shrink-0">
                      상태 변경
                    </h3>
                    {renderStatusChangeButtons(selectedApp)}
                  </div>

                  {/* 완전 삭제 버튼 (취소 상태일 때만 표시) */}
                  {selectedApp.status === 'cancelled' && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
                      <h3 className="text-lg font-medium text-red-900 mb-2">위험 구역</h3>
                      <p className="text-sm text-red-700 mb-4">
                        이 작업은 되돌릴 수 없습니다. 신청 데이터와 모든 첨부 파일이 영구적으로
                        삭제됩니다.
                      </p>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={updateLoading || deleteLoading}
                        className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 ${
                          updateLoading || deleteLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        <FiTrash2 size={16} />
                        완전 삭제
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-32 text-center">
                  <div className="text-gray-400 text-4xl mb-4">👈</div>
                  <p className="text-gray-600">왼쪽 목록에서 항목을 선택하세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 파일 삭제 확인 모달 */}
      {showFileDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">파일 삭제 확인</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                <strong>정말로 이 파일을 삭제하시겠습니까?</strong>
              </p>
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <p className="text-sm text-red-700 mb-2">
                  <strong>⚠️ 주의사항:</strong>
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• 이 작업은 되돌릴 수 없습니다</li>
                  <li>• 파일이 영구적으로 삭제됩니다</li>
                  <li>• 삭제 후 복구가 불가능합니다</li>
                </ul>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>삭제할 파일:</strong> {fileToDelete.name}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowFileDeleteModal(false);
                  setFileToDelete(null);
                }}
                disabled={updateLoading}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleFileDelete}
                disabled={updateLoading}
                className={`px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                  updateLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {updateLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    삭제 중...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    파일 삭제
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 완전 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">완전 삭제 확인</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                <strong>정말로 이 서비스 신청을 완전히 삭제하시겠습니까?</strong>
              </p>
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <p className="text-sm text-red-700 mb-2">
                  <strong>⚠️ 주의사항:</strong>
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• 이 작업은 되돌릴 수 없습니다</li>
                  <li>• 신청 데이터가 영구적으로 삭제됩니다</li>
                  <li>• 모든 첨부 파일이 삭제됩니다</li>
                  <li>• 삭제 후 복구가 불가능합니다</li>
                </ul>
              </div>
              {selectedApp && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>삭제 대상:</strong> {serviceTypeInfo[selectedApp.type]?.text} -{' '}
                    {selectedApp.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    신청일: {formatDate(selectedApp.createdAt)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleApplicationDelete}
                disabled={deleteLoading}
                className={`px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                  deleteLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    삭제 중...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    완전 삭제
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 서비스 유형별 상세 정보 렌더링
function renderApplicationDetails(app) {
  // API에서 전달받은 information 객체 사용
  const info = app.information || {};

  switch (app.type) {
    case 'computer':
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="용도" value={info.purpose} />
            <InfoItem label="예산" value={info.budget} />
            <InfoItem label="CPU" value={info.cpu} />
            <InfoItem label="GPU" value={info.gpu} />
            <InfoItem label="메모리" value={info.memory} />
            <InfoItem label="저장장치" value={info.storage} />
            <InfoItem label="쿨러" value={info.cooling} />
            <InfoItem label="운영체제" value={info.os} />
            <InfoItem label="수령방법" value={info.deliveryMethod} />
          </div>
          <InfoItem label="추가 요청사항" value={info.additionalRequests} />
          <InfoItem label="연락처" value={info.phoneNumber} />
          <InfoItem label="배송주소" value={info.address} />
        </>
      );

    case 'printer':
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="용도" value={info.purpose} />
            <InfoItem label="예산" value={info.budget} />
            <InfoItem label="프린터 종류" value={info.printerType} />
            <InfoItem label="무한잉크젯" value={info.infiniteInk} />
            <InfoItem label="출력색상" value={info.outputColor} />
            <InfoItem label="수령방법" value={info.deliveryMethod} />
          </div>
          <InfoItem label="추가 요청사항" value={info.additionalRequests} />
          <InfoItem label="연락처" value={info.phoneNumber} />
          <InfoItem label="배송주소" value={info.address} />
        </>
      );

    case 'notebook':
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="용도" value={info.purpose} />
            <InfoItem label="예산" value={info.budget} />
            <InfoItem label="CPU" value={info.cpu} />
            <InfoItem label="GPU" value={info.gpu} />
            <InfoItem label="무게" value={info.weight} />
            <InfoItem label="운영체제" value={info.os} />
            <InfoItem label="RAM" value={info.ram} />
            <InfoItem label="저장장치" value={info.storage} />
            <InfoItem label="수령방법" value={info.deliveryMethod} />
          </div>
          <InfoItem label="추가 요청사항" value={info.additionalRequests} />
          <InfoItem label="연락처" value={info.phoneNumber} />
          <InfoItem label="배송주소" value={info.address} />
        </>
      );

    case 'as':
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="A/S 분류" value={info.asCategory} />
            <InfoItem label="사용자 이름" value={info.userName} />
            <InfoItem label="PC 번호" value={info.pcNumber} />
            <InfoItem label="프린터 종류" value={info.printerType} />
            <InfoItem label="무한잉크젯" value={info.infiniteInk} />
            <InfoItem label="수령방법" value={info.deliveryMethod} />
          </div>
          <InfoItem label="문제 설명" value={info.description} />
          <InfoItem label="연락처" value={info.phoneNumber} />
          <InfoItem label="배송주소" value={info.address} />
        </>
      );

    case 'inquiry':
      return (
        <>
          <InfoItem label="제목" value={info.title} />
          <InfoItem label="내용" value={info.content} />
          <InfoItem label="연락처" value={info.phoneNumber} />
        </>
      );

    default:
      return <p className="text-gray-600 italic">상세 정보가 없습니다.</p>;
  }
}

// 정보 항목 컴포넌트
function InfoItem({ label, value }) {
  return value ? (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  ) : null;
}
