'use client';

import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

import { usePrinterEstimateForm } from './hooks/usePrinterEstimateForm';
import { FORM_OPTIONS } from './constants';
import {
  TextArea,
  InputField,
  BudgetInput,
  RadioGroup,
  OptionalSection,
  AddressInput,
  FileUpload,
  SubmitButton,
  ConfirmModal,
  SuccessModal,
  UploadProgress,
} from './components/FormComponents';

export default function PrinterEstimatePage() {
  const {
    // States
    formData,
    selectedFiles,
    totalFileSize,
    openSections,
    isSubmitting,
    fileInputRef,
    showConfirmModal,
    showSuccessModal,
    uploadProgress,

    // Handlers
    handleChange,
    handleSubmitClick,
    handleKeyDown,
    toggleSection,
    addBudget,
    clearBudget,
    handleFileChange,
    removeFile,
    openFileDialog,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleSuccessConfirm,
  } = usePrinterEstimateForm();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          {/* 페이지 헤더 */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-[BMJUA] text-gray-900 mb-2 sm:mb-4">
              프린터 견적 신청
            </h1>
            <p className="text-sm sm:text-lg text-gray-600">
              <span className="text-blue-600 font-semibold">상세한 작성</span>을 통해 더 정확한
              견적을 받으실 수 있습니다
            </p>
          </div>

          {/* 메인 폼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-8">
                  {/* 필수 입력 사항들 */}
                  <TextArea
                    id="purpose"
                    name="purpose"
                    label="사용목적(용도)"
                    placeholder="프린터를 어떤 용도로 사용하실 예정인지 자세히 작성해주세요. (예: 사무용 문서 출력, 사진 인쇄, 라벨 출력 등)"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    rows={3}
                  />

                  <BudgetInput
                    value={formData.budget}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onAddBudget={addBudget}
                    onClearBudget={clearBudget}
                  />

                  <InputField
                    id="phoneNumber"
                    name="phoneNumber"
                    label="연락처"
                    placeholder="010-1234-5678"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required
                    helpText="견적 안내를 위해 연락드리므로 정확하게 입력해주세요."
                  />

                  {/* 선택 사항들 */}
                  <OptionalSection
                    title="프린터 종류 (선택사항)"
                    isOpen={openSections.printerType}
                    onToggle={() => toggleSection('printerType')}
                  >
                    <div className="mt-2 sm:mt-3">
                      <RadioGroup
                        name="printerType"
                        label=""
                        options={FORM_OPTIONS.printerType}
                        value={formData.printerType}
                        onChange={handleChange}
                        columns={2}
                      />
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="무한잉크젯 (선택사항)"
                    isOpen={openSections.infiniteInk}
                    onToggle={() => toggleSection('infiniteInk')}
                  >
                    <div className="mt-2 sm:mt-3">
                      <RadioGroup
                        name="infiniteInk"
                        label=""
                        options={FORM_OPTIONS.infiniteInk}
                        value={formData.infiniteInk}
                        onChange={handleChange}
                        columns={2}
                      />
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="출력 색상 (선택사항)"
                    isOpen={openSections.outputColor}
                    onToggle={() => toggleSection('outputColor')}
                  >
                    <div className="mt-2 sm:mt-3">
                      <RadioGroup
                        name="outputColor"
                        label=""
                        options={FORM_OPTIONS.outputColor}
                        value={formData.outputColor}
                        onChange={handleChange}
                        columns={2}
                      />
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="수령방법 (선택사항)"
                    isOpen={openSections.deliveryMethod}
                    onToggle={() => toggleSection('deliveryMethod')}
                  >
                    <div className="mt-2 sm:mt-3 space-y-3 sm:space-y-4">
                      <RadioGroup
                        name="deliveryMethod"
                        label=""
                        options={FORM_OPTIONS.deliveryMethod}
                        value={formData.deliveryMethod}
                        onChange={handleChange}
                        columns={2}
                      />

                      {/* 택배 선택시 주소 입력 */}
                      {formData.deliveryMethod === '택배' && (
                        <AddressInput value={formData.address} onChange={handleChange} />
                      )}
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="추가요청사항 (선택사항)"
                    isOpen={openSections.additionalRequests}
                    onToggle={() => toggleSection('additionalRequests')}
                  >
                    <div className="mt-2 sm:mt-3">
                      <TextArea
                        id="additionalRequests"
                        name="additionalRequests"
                        label=""
                        placeholder="추가적인 요청사항이나 특별히 고려해야 할 사항이 있으시면 작성해주세요"
                        value={formData.additionalRequests}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </OptionalSection>

                  {/* 첨부파일 */}
                  <FileUpload
                    fileInputRef={fileInputRef}
                    selectedFiles={selectedFiles}
                    totalFileSize={totalFileSize}
                    onFileChange={handleFileChange}
                    onRemoveFile={removeFile}
                    onOpenFileDialog={openFileDialog}
                  />
                </div>

                {/* 제출 버튼 */}
                <SubmitButton isSubmitting={isSubmitting} onSubmit={handleSubmitClick} />
              </div>
            </form>
          </motion.div>

          {/* 확인 모달 */}
          <ConfirmModal
            isOpen={showConfirmModal}
            onConfirm={handleConfirmSubmit}
            onCancel={handleCancelSubmit}
          />

          {/* 성공 모달 */}
          <SuccessModal isOpen={showSuccessModal} onConfirm={handleSuccessConfirm} />

          {/* 업로드 진행률 모달 */}
          <UploadProgress progress={uploadProgress} />
        </div>
      </LoggedInOnlySection>
    </div>
  );
}
