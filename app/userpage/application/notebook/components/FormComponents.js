import {
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiPaperclip,
  FiAlertCircle,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { BUDGET_AMOUNTS, FILE_CONSTRAINTS } from '../constants';
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

// 예산 입력 컴포넌트
export const BudgetInput = ({ value, onChange, onKeyDown, onAddBudget, onClearBudget }) => (
  <div>
    <label
      htmlFor="budget"
      className="block text-base sm:text-lg font-[BMJUA] text-gray-900 mb-2 sm:mb-3"
    >
      예산 <span className="text-red-500">*</span>
    </label>
    <div className="space-y-2 sm:space-y-3">
      <input
        type="text"
        id="budget"
        name="budget"
        className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm sm:text-base"
        placeholder="예산을 입력해주세요 (원)"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <div className="flex gap-1 sm:gap-2 flex-wrap">
        {BUDGET_AMOUNTS.map((budget) => (
          <button
            key={budget.value}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onAddBudget(budget.value);
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {budget.label}
          </button>
        ))}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClearBudget();
          }}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          초기화
        </button>
      </div>
    </div>
  </div>
);

// 라디오 버튼 그룹 컴포넌트
export const RadioGroup = ({
  name,
  label,
  options,
  value,
  onChange,
  required = false,
  columns = 2,
}) => {
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'grid grid-cols-1 gap-2 sm:gap-3';
      case 2:
        return 'grid grid-cols-2 gap-2 sm:gap-3';
      case 3:
        return 'grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3';
      case 4:
        return 'grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3';
      case 6:
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3';
      default:
        return 'grid grid-cols-2 gap-2 sm:gap-3';
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-base sm:text-lg font-[BMJUA] text-gray-900 mb-2 sm:mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={getGridClass()}>
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center justify-center p-2 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              value === option
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onChange({ target: { name, value: option } });
            }}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={onChange}
              className="sr-only"
              tabIndex={-1}
            />
            <span className="font-medium text-xs sm:text-sm text-center">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// 토글 가능한 선택사항 섹션
export const OptionalSection = ({ title, isOpen, onToggle, children }) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      tabIndex={0}
    >
      <span className="text-base sm:text-lg font-[BMJUA] text-gray-900">{title}</span>
      {isOpen ? (
        <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </button>
    {isOpen && <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200">{children}</div>}
  </div>
);

// 주소 입력 컴포넌트
export const AddressInput = ({ value, onChange }) => (
  <div className="mt-3 sm:mt-4">
    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      배송주소
    </label>
    <textarea
      id="address"
      name="address"
      rows={2}
      className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm sm:text-base"
      placeholder="택배로 받으실 주소를 입력해주세요"
      value={value}
      onChange={onChange}
    />
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
          참고할 파일이 있으면 업로드해주세요
        </p>
        <p className="text-xs text-gray-400 mt-1">최대 파일 크기: 총 4MB</p>
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

      {totalFileSize > 2097152 && (
        <div className="mt-2 sm:mt-3 flex items-center text-xs text-amber-700">
          <FiAlertCircle className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
          <span>총 파일 크기가 {formatFileSize(totalFileSize)} / 4MB</span>
        </div>
      )}
    </div>
  </div>
);

// 제출 버튼 컴포넌트
export const SubmitButton = ({ isSubmitting, onSubmit }) => (
  <div className="mt-6 sm:mt-10">
    <p className="text-gray-500 text-xs sm:text-sm text-center mb-4 sm:mb-6 bg-yellow-50/50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border border-yellow-100">
      ⚠️ 부품 수급상황에 따라 요구사항이 모두 수용되지 않을 수 있습니다.
      <br />
      💰 예산 가이드 입력하신 예산 범위 내에서 최적의 성능을 구성해드립니다.
      <br />더 높은 성능이 필요하시다면 예산 조정이나 단계별 업그레이드 방안도 함께 제안해드릴 수
      있어요!
    </p>
    <button
      type="button"
      onClick={onSubmit}
      disabled={isSubmitting}
      className={`w-full font-[NanumGothic] text-lg sm:text-xl font-bold text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-200 ${
        isSubmitting
          ? 'bg-blue-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg'
      }`}
    >
      {isSubmitting ? '신청 중...' : '노트북 견적 신청하기'}
    </button>
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
          <h3 className="text-lg font-[BMJUA] text-gray-900">견적 신청 확인</h3>
        </div>

        <p className="text-gray-700 mb-6 text-sm sm:text-base">
          해당 견적을 제출하시면 수정 할 수 없습니다.
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

          <h3 className="text-xl font-[BMJUA] text-gray-900 mb-2">
            노트북 견적 신청이 완료되었습니다!
          </h3>

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
