'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

export default function InquiryPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API 연동 예정
    console.log(formData);
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
                        required
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
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        연락처
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 연락처를 입력해주세요. 입력하지 않으면 회원가입할 때 입력한 번호로 연락드립니다"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                    >
                      문의하기
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
