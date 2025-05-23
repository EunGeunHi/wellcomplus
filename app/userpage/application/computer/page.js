'use client';

import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

import { useComputerEstimateForm } from './hooks/useComputerEstimateForm';
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
} from './components/FormComponents';

export default function ComputerEstimatePage() {
  const {
    // States
    formData,
    selectedFiles,
    totalFileSize,
    openSections,
    isSubmitting,
    fileInputRef,

    // Handlers
    handleChange,
    handleSubmit,
    handleKeyDown,
    toggleSection,
    addBudget,
    clearBudget,
    handleFileChange,
    removeFile,
    openFileDialog,
  } = useComputerEstimateForm();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          {/* 페이지 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-[BMJUA] text-gray-900 mb-4">컴퓨터 견적 신청</h1>
            <p className="text-lg text-gray-600">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                <div className="space-y-8">
                  {/* 필수 입력 사항들 */}
                  <TextArea
                    id="purpose"
                    name="purpose"
                    label="사용목적(용도)"
                    placeholder="컴퓨터를 어떤 용도로 사용하실 예정인지 자세히 작성해주세요. (예: 게임, 업무용, 영상편집 등)"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                  />

                  <BudgetInput
                    value={formData.budget}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onAddBudget={addBudget}
                    onClearBudget={clearBudget}
                  />

                  <RadioGroup
                    name="os"
                    label="운영체제"
                    options={FORM_OPTIONS.os}
                    value={formData.os}
                    onChange={handleChange}
                    required
                    columns={2}
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
                    title="CPU (선택사항)"
                    isOpen={openSections.cpu}
                    onToggle={() => toggleSection('cpu')}
                  >
                    <div className="mt-3">
                      <RadioGroup
                        name="cpu"
                        label=""
                        options={FORM_OPTIONS.cpu}
                        value={formData.cpu}
                        onChange={handleChange}
                        columns={2}
                      />
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="그래픽카드 (선택사항)"
                    isOpen={openSections.gpu}
                    onToggle={() => toggleSection('gpu')}
                  >
                    <div className="mt-3">
                      <RadioGroup
                        name="gpu"
                        label=""
                        options={FORM_OPTIONS.gpu}
                        value={formData.gpu}
                        onChange={handleChange}
                        columns={2}
                      />
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="메모리 (선택사항)"
                    isOpen={openSections.memory}
                    onToggle={() => toggleSection('memory')}
                  >
                    <div className="mt-3">
                      <RadioGroup
                        name="memory"
                        label=""
                        options={FORM_OPTIONS.memory}
                        value={formData.memory}
                        onChange={handleChange}
                        columns={3}
                      />
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="SSD/HDD(저장 용량) (선택사항)"
                    isOpen={openSections.storage}
                    onToggle={() => toggleSection('storage')}
                  >
                    <div className="mt-3">
                      <RadioGroup
                        name="storage"
                        label=""
                        options={FORM_OPTIONS.storage}
                        value={formData.storage}
                        onChange={handleChange}
                        columns={4}
                      />
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="쿨러/튜닝 (선택사항)"
                    isOpen={openSections.cooling}
                    onToggle={() => toggleSection('cooling')}
                  >
                    <div className="mt-3">
                      <RadioGroup
                        name="cooling"
                        label=""
                        options={FORM_OPTIONS.cooling}
                        value={formData.cooling}
                        onChange={handleChange}
                        columns={3}
                      />
                    </div>
                  </OptionalSection>

                  <OptionalSection
                    title="수령방법 (선택사항)"
                    isOpen={openSections.deliveryMethod}
                    onToggle={() => toggleSection('deliveryMethod')}
                  >
                    <div className="mt-3 space-y-4">
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
                    <div className="mt-3">
                      <TextArea
                        id="additionalRequests"
                        name="additionalRequests"
                        label=""
                        placeholder="추가적인 요청사항이나 특별히 고려해야 할 사항이 있으시면 작성해주세요"
                        value={formData.additionalRequests}
                        onChange={handleChange}
                        rows={4}
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
                <SubmitButton isSubmitting={isSubmitting} />
              </div>
            </form>
          </motion.div>
        </div>
      </LoggedInOnlySection>
    </div>
  );
}
