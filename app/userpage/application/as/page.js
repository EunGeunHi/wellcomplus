'use client';

import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

import { useASApplicationForm } from './hooks/useASApplicationForm';
import { FORM_OPTIONS } from './constants';
import {
  TextArea,
  InputField,
  SelectField,
  RadioGroup,
  AddressInput,
  FileUpload,
  SubmitButton,
} from './components/FormComponents';

export default function ASApplicationPage() {
  const {
    // States
    formData,
    selectedFiles,
    totalFileSize,
    isSubmitting,
    fileInputRef,

    // Handlers
    handleChange,
    handleSubmit,
    handleKeyDown,
    handleFileChange,
    removeFile,
    openFileDialog,
  } = useASApplicationForm();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          {/* 페이지 헤더 */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-[BMJUA] text-gray-900 mb-2 sm:mb-4">
              A/S 신청
            </h1>
            <p className="text-sm sm:text-lg text-gray-600">
              <span className="text-blue-600 font-semibold">상세한 작성</span>을 통해 더 빠른 A/S
              처리가 가능합니다
            </p>
          </div>

          {/* 메인 폼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-8">
                  {/* 필수 입력 사항들 */}
                  <SelectField
                    id="asCategory"
                    name="asCategory"
                    label="A/S 분류"
                    options={FORM_OPTIONS.asCategory}
                    value={formData.asCategory}
                    onChange={handleChange}
                    required
                    placeholder="제품 종류를 선택해주세요"
                  />

                  {/* 컴퓨터/노트북 선택시 조건부 필드 */}
                  {(formData.asCategory === '컴퓨터' || formData.asCategory === '노트북') && (
                    <div className="space-y-4">
                      <InputField
                        id="userName"
                        name="userName"
                        label="구매 당시 사용자 이름"
                        placeholder="제품 구매 당시 등록한 사용자 이름을 입력해주세요"
                        value={formData.userName}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                      />
                      <InputField
                        id="pcNumber"
                        name="pcNumber"
                        label="구매한 PC 번호"
                        placeholder="구매한 PC 번호를 입력해주세요"
                        value={formData.pcNumber}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  )}

                  {/* 프린터 선택시 조건부 필드 */}
                  {formData.asCategory === '프린터' && (
                    <div className="space-y-4 sm:space-y-6">
                      <InputField
                        id="userName"
                        name="userName"
                        label="구매 당시 사용자 이름"
                        placeholder="프린터 구매 당시 등록된 사용자 이름을 입력해주세요"
                        value={formData.userName}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                      />

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
                        label="무한 잉크젯"
                        options={FORM_OPTIONS.infiniteInk}
                        value={formData.infiniteInk}
                        onChange={handleChange}
                        columns={2}
                      />
                    </div>
                  )}

                  <TextArea
                    id="description"
                    name="description"
                    label="문제 설명"
                    placeholder="제품에 발생한 문제를 자세히 설명해주세요. (예: 컴퓨터가 켜지지 않습니다, 프린터에서 용지가 걸립니다, 노트북 배터리가 빨리 닳습니다)"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
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
                    helpText="A/S 처리 상황을 연락드리므로 정확하게 입력해주세요."
                  />

                  {/* 수령방법 - 바로 표시 */}
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
                <SubmitButton isSubmitting={isSubmitting} />
              </div>
            </form>
          </motion.div>
        </div>
      </LoggedInOnlySection>
    </div>
  );
}
