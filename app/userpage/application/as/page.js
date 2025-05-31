'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

import { useASApplicationForm } from './hooks/useASApplicationForm';
import { FORM_OPTIONS } from './constants';
import {
  TextArea,
  InputField,
  SelectField,
  RadioGroup,
  OptionalSection,
  AddressInput,
  FileUpload,
  SubmitButton,
  ConfirmModal,
  SuccessModal,
  UploadProgress,
} from './components/FormComponents';

export default function ASApplicationPage() {
  const { data: session } = useSession();

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
    handleFileChange,
    removeFile,
    openFileDialog,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleSuccessConfirm,
  } = useASApplicationForm(session);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          {/* 페이지 헤더 */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-[BMJUA] text-gray-900 mb-2 sm:mb-4">
              A/S 신청
            </h1>
            <p className="text-sm sm:text-lg text-gray-600">
              고장 증상을 <span className="text-blue-600 font-semibold">상세히 작성</span>해주시면
              더 빠른 해결이 가능합니다
            </p>
          </div>

          {/* 메인 폼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-3 sm:p-8">
                <div className="space-y-3 sm:space-y-4">
                  {/* 필수 입력 사항들 */}
                  <SelectField
                    id="asCategory"
                    name="asCategory"
                    label="A/S 분류"
                    options={FORM_OPTIONS.asCategory}
                    value={formData.asCategory}
                    onChange={handleChange}
                    required
                    placeholder="A/S를 받을 제품을 선택해주세요"
                  />
                  {/* 분류별 추가 정보 */}
                  {formData.asCategory && formData.asCategory !== '기타' && (
                    <OptionalSection
                      title="추가 정보 (A/S 받을 제품 관련정보)"
                      isOpen={openSections.additionalInfo}
                      onToggle={() => toggleSection('additionalInfo')}
                    >
                      <div className="mt-1.5 sm:mt-3 space-y-1.5 sm:space-y-4">
                        {(formData.asCategory === '컴퓨터' || formData.asCategory === '노트북') && (
                          <>
                            <InputField
                              id="userName"
                              name="userName"
                              label="구매 당시 사용자 이름"
                              placeholder="구매 시 등록된 이름을 입력해주세요"
                              value={formData.userName}
                              onChange={handleChange}
                              onKeyDown={handleKeyDown}
                            />

                            <InputField
                              id="pcNumber"
                              name="pcNumber"
                              label="PC 번호"
                              placeholder="PC에 부착된 번호를 입력해주세요 (예: PC-001)"
                              value={formData.pcNumber}
                              onChange={handleChange}
                              onKeyDown={handleKeyDown}
                            />
                          </>
                        )}

                        {formData.asCategory === '프린터' && (
                          <>
                            <RadioGroup
                              name="printerType"
                              label="프린터 종류"
                              options={FORM_OPTIONS.printerType}
                              value={formData.printerType}
                              onChange={handleChange}
                              columns={2}
                            />

                            <RadioGroup
                              name="infiniteInk"
                              label="무한잉크젯 여부"
                              options={FORM_OPTIONS.infiniteInk}
                              value={formData.infiniteInk}
                              onChange={handleChange}
                              columns={2}
                            />
                          </>
                        )}
                      </div>
                    </OptionalSection>
                  )}

                  <TextArea
                    id="description"
                    name="description"
                    label="상세 설명"
                    placeholder="문제 상황을 자세히 설명해주세요. (예: 전원이 안 켜짐, 화면이 깜빡임 등)"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
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
                    helpText="A/S 진행 상황 안내를 위해 연락드리므로 정확하게 입력해주세요."
                  />

                  {/* 수령방법 */}
                  <div className="space-y-3 sm:space-y-4">
                    <RadioGroup
                      name="deliveryMethod"
                      label="수령방법"
                      options={FORM_OPTIONS.deliveryMethod}
                      value={formData.deliveryMethod}
                      onChange={handleChange}
                      required
                      columns={2}
                    />

                    {/* 택배 선택시 주소 입력 */}
                    {formData.deliveryMethod === '택배' && (
                      <AddressInput value={formData.address} onChange={handleChange} />
                    )}
                  </div>

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
