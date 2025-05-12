'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiX, FiPaperclip, FiAlertCircle } from 'react-icons/fi';

export default function InquiryPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    phoneNumber: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [totalFileSize, setTotalFileSize] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles];
    let newTotalSize = totalFileSize;

    files.forEach((file) => {
      // 파일 크기 계산 (바이트)
      newTotalSize += file.size;
      newFiles.push(file);
    });

    // 총 파일 크기가 2MB(2,097,152 바이트)를 초과하는지 확인
    if (newTotalSize > 2097152) {
      toast.error('총 파일 크기가 2MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFiles(newFiles);
    setTotalFileSize(newTotalSize);
    e.target.value = null; // 입력 필드 초기화
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const removedFile = newFiles[index];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setTotalFileSize(totalFileSize - removedFile.size);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.title.trim() || !formData.content.trim() || !formData.phoneNumber.trim()) {
      toast.error('제목, 문의 내용, 연락처는 \n필수로 입력해야 합니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      // FormData 객체 생성 - 파일 업로드를 위함
      const formDataToSubmit = new FormData();

      // 폼 데이터 추가
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });

      // 파일 추가
      selectedFiles.forEach((file) => {
        formDataToSubmit.append('files', file);
      });

      const response = await fetch('/api/applications/inquiry', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!response.ok) {
        throw new Error('문의 등록 중 오류가 발생했습니다.');
      }

      toast.success('문의가 등록되었습니다!');
      // 폼 초기화
      setFormData({
        title: '',
        content: '',
        phoneNumber: '',
      });
      setSelectedFiles([]);
      setTotalFileSize(0);

      // 1초 후 메인 페이지로 이동
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error.message || '문의 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const examples = {
    title: '- 견적 문의 관련 질문\n- 제품 재고 확인 요청\n- 서비스 이용 방법 문의',
    content:
      '- 견적 신청한 제품의 진행 상황이 궁금합니다\n- 특정 제품의 재고나 입고 일정을 알고 싶습니다\n- 웹사이트 이용 중 발생한 문제를 해결하고 싶습니다',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-[BMJUA] text-gray-900 mb-4">기타 문의</h1>
            <p className="text-lg text-gray-600">
              <span className="text-blue-600 font-semibold">상세한 작성</span>을 통해 더 정확한
              답변을 받으실 수 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 작성 예시 섹션 */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sticky top-8"
              >
                <h2 className="text-2xl font-[BMJUA] text-gray-900 mb-6">작성 예시</h2>
                <div className="space-y-6">
                  {Object.entries(examples).map(([key, value]) => (
                    <div key={key} className="bg-blue-50/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        {key === 'title' ? '문의 제목' : '문의 내용'}
                      </h3>
                      <p className="text-gray-600 whitespace-pre-line text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* 문의 폼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        문의 제목*
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 문의하실 내용의 제목을 입력해주세요"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="content"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        문의 내용*
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows={8}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 문의하실 내용을 자세히 작성해주세요"
                        value={formData.content}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        연락처*
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 해당 번호로 연락을 드리므로 정확하게 입력해주세요."
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>

                    {/* 파일 업로드 섹션 */}
                    <div>
                      <label className="block text-lg font-[BMJUA] text-gray-900 mb-2">
                        첨부 파일
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center mb-4">
                          <FiPaperclip className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-1 text-sm text-gray-500">
                            문의와 관련된 참고 파일이 있으면 업로드해주세요
                          </p>
                          <p className="text-xs text-gray-400 mt-1">최대 파일 크기: 총 2MB</p>
                        </div>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          multiple
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.txt"
                        />

                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            파일 선택
                          </button>
                        </div>

                        {selectedFiles.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              선택된 파일 ({formatFileSize(totalFileSize)})
                            </div>
                            <ul className="space-y-2">
                              {selectedFiles.map((file, index) => (
                                <li
                                  key={index}
                                  className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-md"
                                >
                                  <div className="flex items-center">
                                    <span className="truncate max-w-xs">{file.name}</span>
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({formatFileSize(file.size)})
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-gray-500 hover:text-red-500"
                                  >
                                    <FiX />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {totalFileSize > 1048576 && (
                          <div className="mt-3 flex items-center text-xs text-amber-700">
                            <FiAlertCircle className="mr-1" />
                            <span>총 파일 크기가 {formatFileSize(totalFileSize)} / 2MB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full font-[NanumGothic] text-xl font-bold text-white py-4 px-6 rounded-lg transition-colors duration-200 ${
                        isSubmitting
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {isSubmitting ? '등록 중...' : '문의하기'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </LoggedInOnlySection>
    </div>
  );
}
