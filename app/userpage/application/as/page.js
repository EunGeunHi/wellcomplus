'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

export default function ASRequestPage() {
  const [formData, setFormData] = useState({
    itemType: '',
    description: '',
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
    description:
      '- 컴퓨터가 켜지지 않습니다\n- 프린터에서 용지가 걸립니다\n- 노트북 배터리가 빨리 닳습니다',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-[BMJUA] text-gray-900 mb-4">AS 신청</h1>
            <p className="text-lg text-gray-600">
              <span className="text-blue-600 font-semibold">상세한 작성</span>을 통해 더 빠른 AS
              처리가 가능합니다
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
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">AS 요청 내용</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">
                      {examples.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* AS 신청 폼 */}
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
                      <label className="block text-lg font-[BMJUA] text-gray-900 mb-4">
                        AS 품목*
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['컴퓨터', '프린터', '노트북'].map((item) => (
                          <div key={item} className="relative">
                            <input
                              type="radio"
                              id={item}
                              name="itemType"
                              value={item}
                              className="peer hidden"
                              onChange={handleChange}
                              checked={formData.itemType === item}
                              required
                            />
                            <label
                              htmlFor={item}
                              className="block w-full p-4 text-center border-2 rounded-lg cursor-pointer transition-colors
                                peer-checked:border-blue-500 peer-checked:bg-blue-50
                                hover:bg-gray-50"
                            >
                              {item}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        AS 요청 내용*
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={6}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) AS가 필요한 증상이나 문제점을 자세히 설명해주세요"
                        value={formData.description}
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
                      AS 신청하기
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
