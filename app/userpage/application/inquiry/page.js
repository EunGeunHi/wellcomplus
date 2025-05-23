'use client';

import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

import { useInquiryForm } from './hooks/useInquiryForm';
import { TextArea, InputField, FileUpload, SubmitButton } from './components/FormComponents';

export default function InquiryPage() {
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
  } = useInquiryForm();

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
              <span className="text-blue-600 font-semibold">상세한 작성</span>을 통해 더 정확한
              답변을 받으실 수 있습니다
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
                  <InputField
                    id="title"
                    name="title"
                    label="문의 제목"
                    placeholder="문의하실 내용의 제목을 입력해주세요"
                    value={formData.title}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required
                  />

                  <TextArea
                    id="content"
                    name="content"
                    label="문의 내용"
                    placeholder="문의하실 내용을 자세히 작성해주세요. (예: 견적 신청한 제품의 진행 상황이 궁금합니다, 특정 제품의 재고나 입고 일정을 알고 싶습니다)"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={8}
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
                    helpText="답변을 위해 연락드리므로 정확하게 입력해주세요."
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
                <SubmitButton isSubmitting={isSubmitting} />
              </div>
            </form>
          </motion.div>
        </div>
      </LoggedInOnlySection>
    </div>
  );
}
