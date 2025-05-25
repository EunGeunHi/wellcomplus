import {
  FiX,
  FiPaperclip,
  FiAlertCircle,
  FiCheckCircle,
  FiAlertTriangle,
  FiUpload,
} from 'react-icons/fi';
import { FILE_CONSTRAINTS } from '../constants';
import { formatFileSize } from '../utils';

// 텍스트 에리어 컴포넌트
export const TextArea = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  required = false,
}) => (
  <div>
    {label && (
      <label
        htmlFor={id}
        className="block text-base sm:text-lg font-[BMJUA] text-gray-900 mb-2 sm:mb-3"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      id={id}
      name={name}
      rows={rows}
      className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm sm:text-base"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

// 인풋 필드 컴포넌트
export const InputField = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onKeyDown,
  type = 'text',
  required = false,
  helpText,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-base sm:text-lg font-[BMJUA] text-gray-900 mb-2 sm:mb-3"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm sm:text-base"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
    {helpText && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">{helpText}</p>}
  </div>
);

// 파일 업로드 컴포넌트
export const FileUpload = ({
  fileInputRef,
  selectedFiles,
  totalFileSize,
  onFileChange,
  onRemoveFile,
  onOpenFileDialog,
}) => (
  <div>
    <label className="block text-base sm:text-lg font-[BMJUA] text-gray-900 mb-2 sm:mb-3">
      첨부파일 (선택사항)
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
      <div className="text-center mb-3 sm:mb-4">
        <FiPaperclip className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
          문의와 관련된 참고 파일이 있으면 업로드해주세요
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        multiple
        className="hidden"
        accept={FILE_CONSTRAINTS.ACCEPTED_TYPES}
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onOpenFileDialog();
          }}
          className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          파일 선택
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
            선택된 파일 ({formatFileSize(totalFileSize)})
          </div>
          <ul className="space-y-1 sm:space-y-2">
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded-md"
              >
                <div className="flex items-center">
                  <span className="truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="text-gray-500 hover:text-red-500 transition-colors p-1"
                >
                  <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

// 업로드 진행률 컴포넌트
export const UploadProgress = ({ progress }) => {
  if (!progress) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center">
          <div className="mb-4">
            <FiUpload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-lg font-[BMJUA] text-gray-900">파일 업로드 중</h3>
          </div>

          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {progress.current} / {progress.total} 파일 업로드 중...
            </p>
            <p className="text-xs text-gray-500 mt-1">{progress.fileName}</p>
          </div>

          {progress.status === 'error' && (
            <div className="text-red-600 text-sm">오류: {progress.error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// 제출 버튼 컴포넌트
export const SubmitButton = ({ isSubmitting, onSubmit }) => (
  <div className="mt-6 sm:mt-10">
    <button
      type="button"
      onClick={onSubmit}
      disabled={isSubmitting}
      className={`w-full font-[NanumGothic] text-lg sm:text-xl font-bold text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 ${
        isSubmitting
          ? 'bg-blue-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg'
      }`}
    >
      {isSubmitting && (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
      {isSubmitting ? '등록 중...' : '문의하기'}
    </button>
    {isSubmitting && (
      <p className="text-center text-sm text-gray-600 mt-3">
        📱 모바일에서는 화면을 끄지 마시고 잠시만 기다려주세요.
      </p>
    )}
  </div>
);

// 확인 대화상자 모달 컴포넌트
export const ConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="bg-yellow-100 rounded-full p-2 mr-3">
            <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-[BMJUA] text-gray-900">문의 등록 확인</h3>
        </div>

        <p className="text-gray-700 mb-6 text-sm sm:text-base">
          해당 문의를 제출하시면 수정 할 수 없습니다.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

// 성공 메시지 모달 컴포넌트
export const SuccessModal = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center">
          <div className="bg-green-100 rounded-full p-3 inline-block mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h3 className="text-xl font-[BMJUA] text-gray-900 mb-2">문의가 완료되었습니다!</h3>

          <p className="text-gray-700 mb-6 text-sm sm:text-base">
            확인 후 개별 연락 드리겠습니다. 감사합니다.
          </p>

          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
