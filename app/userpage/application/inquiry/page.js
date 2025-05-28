'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

import { useInquiryForm } from './hooks/useInquiryForm';
import {
  TextArea,
  InputField,
  FileUpload,
  SubmitButton,
  ConfirmModal,
  SuccessModal,
  UploadProgress,
} from './components/FormComponents';

export default function InquiryPage() {
  const { data: session } = useSession();

  const {
    // States
    formData,
    selectedFiles,
    totalFileSize,
    isSubmitting,
    fileInputRef,
    showConfirmModal,
    showSuccessModal,
    uploadProgress,

    // Handlers
    handleChange,
    handleSubmitClick,
    handleKeyDown,
    handleFileChange,
    removeFile,
    openFileDialog,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleSuccessConfirm,
  } = useInquiryForm(session);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          {/* 페이지 헤더 */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-[BMJUA] text-gray-900 mb-2 sm:mb-4">
              기타 문의
            </h1>
            <p className="text-sm sm:text-lg text-gray-600">
              견적 이외의 궁금한 사항이 있으시면{' '}
              <span className="text-blue-600 font-semibold">언제든지 문의</span>해주세요
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
                <div className="space-y-2 sm:space-y-4">
                  {/* 필수 입력 사항들 */}
                  <InputField
                    id="title"
                    name="title"
                    label="문의 제목"
                    placeholder="문의하실 내용을 간단히 요약해주세요"
                    value={formData.title}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required
                  />

                  <TextArea
                    id="content"
                    name="content"
                    label="문의 내용"
                    placeholder="궁금한 사항을 자세히 작성해주세요"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={6}
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
                    helpText="답변 안내를 위해 연락드리므로 정확하게 입력해주세요."
                  />

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
