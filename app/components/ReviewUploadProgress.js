'use client';

import { FiUpload, FiCheck, FiX, FiImage } from 'react-icons/fi';

const ReviewUploadProgress = ({ progress, onCancel }) => {
  if (!progress) return null;

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'uploading':
        return <FiUpload className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'completed':
        return <FiCheck className="w-6 h-6 text-green-500" />;
      case 'error':
        return <FiX className="w-6 h-6 text-red-500" />;
      default:
        return <FiImage className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'uploading':
        return '업로드 중...';
      case 'completed':
        return '업로드 완료!';
      case 'error':
        return '업로드 실패';
      default:
        return '준비 중...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">{getStatusIcon()}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">이미지 업로드</h3>
          <p className="text-sm text-gray-600">{getStatusText()}</p>
          {progress.status === 'uploading' && (
            <p className="text-xs text-blue-600 mt-1">완료될 때까지 화면을 끄지 마세요</p>
          )}
        </div>

        {/* 진행률 바 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {progress.current} / {progress.total}
            </span>
            <span className="text-sm font-medium text-gray-700">{progress.percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${getStatusColor()}`}
              style={{ width: `${progress.percentage || 0}%` }}
            />
          </div>
        </div>

        {/* 현재 파일 정보 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-700">현재 파일:</p>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
              {progress.current}/{progress.total}
            </span>
          </div>
          <p className="text-xs text-gray-600 truncate font-mono" title={progress.fileName}>
            {progress.fileName}
          </p>
          {progress.status === 'uploading' && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-blue-600">업로드 중...</span>
            </div>
          )}
        </div>

        {/* 오류 메시지 */}
        {progress.status === 'error' && progress.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{progress.error}</p>
          </div>
        )}

        {/* 완료/오류 시 확인 버튼 */}
        {(progress.status === 'completed' || progress.status === 'error') && (
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className={`w-full py-3 px-4 rounded-lg transition-colors text-sm font-medium ${
                progress.status === 'completed'
                  ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
                  : 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
              }`}
            >
              {progress.status === 'completed' ? '✅ 확인' : '🔄 다시 시도'}
            </button>
            {progress.status === 'completed' && (
              <p className="text-xs text-center text-green-600">
                🎉 모든 이미지가 성공적으로 업로드되었습니다!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewUploadProgress;
