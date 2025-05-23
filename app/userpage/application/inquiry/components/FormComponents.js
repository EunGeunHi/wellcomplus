import { FiX, FiPaperclip, FiAlertCircle } from 'react-icons/fi';
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
        <p className="text-xs text-gray-400 mt-1">최대 파일 크기: 총 2MB</p>
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

      {totalFileSize > 1048576 && (
        <div className="mt-2 sm:mt-3 flex items-center text-xs text-amber-700">
          <FiAlertCircle className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
          <span>총 파일 크기가 {formatFileSize(totalFileSize)} / 2MB</span>
        </div>
      )}
    </div>
  </div>
);

// 제출 버튼 컴포넌트
export const SubmitButton = ({ isSubmitting }) => (
  <div className="mt-6 sm:mt-10">
    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full font-[NanumGothic] text-lg sm:text-xl font-bold text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-200 ${
        isSubmitting
          ? 'bg-blue-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg'
      }`}
    >
      {isSubmitting ? '등록 중...' : '문의하기'}
    </button>
  </div>
);
