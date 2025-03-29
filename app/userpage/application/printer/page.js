'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

export default function PrinterEstimatePage() {
  const [formData, setFormData] = useState({
    modelName: '',
    purpose: '',
    requiredFeatures: '',
    modification: '',
    additional: '',
    phoneNumber: '',
    address: '',
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
    modelName: '- HP LaserJet Pro M428\n- Canon PIXMA G3910\n- Epson L4260',
    purpose: '- 사무실 문서 출력용\n- 가정용 사진 출력용\n- 대량 인쇄용',
    requiredFeatures:
      '- 무선 연결 기능 필요\n- 자동 양면 인쇄 기능 필요\n- 스캔 기능 필요\n- 팩스 인쇄 기능 필요',
    modification: '- 무한공급기 장착 필요\n- 특수 용지 지원 필요\n- 고용량 카트리지 필요',
    additional: '',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-[BMJUA] text-gray-900 mb-4">프린터 견적 신청</h1>
            <p className="text-lg text-gray-600">
              <span className="text-blue-600 font-semibold">상세한 작성</span>을 통해 더 정확한
              견적을 받으실 수 있습니다
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
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">원하는 모델명</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">
                      {examples.modelName}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">용도</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{examples.purpose}</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">필요 기능</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">
                      {examples.requiredFeatures}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">개조 여부</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">
                      {examples.modification}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <div className="flex flex-col mb-3">
                      <h3 className="text-lg font-semibold text-blue-800 mb-1">추가 요구사항</h3>
                      <div className="inline-flex items-center text-xs px-3 py-1 bg-blue-100/50 rounded-full w-fit">
                        <span className="text-blue-700">
                          ✓ 추가로 원하는 것이 있으시다면 작성해주세요
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">
                        {examples.additional}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 견적 신청 폼 */}
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
                        htmlFor="modelName"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        원하는 모델명
                      </label>
                      <textarea
                        id="modelName"
                        name="modelName"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 프린터 모델명이 있다면 작성해주세요"
                        value={formData.modelName}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="purpose"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        용도*
                      </label>
                      <textarea
                        id="purpose"
                        name="purpose"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 프린터 사용 용도를 작성해주세요"
                        value={formData.purpose}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="requiredFeatures"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        필요 기능*
                      </label>
                      <textarea
                        id="requiredFeatures"
                        name="requiredFeatures"
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 필요한 프린터 기능을 작성해주세요"
                        value={formData.requiredFeatures}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="modification"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        개조 여부
                      </label>
                      <textarea
                        id="modification"
                        name="modification"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 무한공급기 등 개조 여부가 있다면 작성해주세요"
                        value={formData.modification}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="additional"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        추가 요구사항
                      </label>
                      <textarea
                        id="additional"
                        name="additional"
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 추가적인 요구사항이나 참고사항을 자유롭게 작성해주세요"
                        value={formData.additional}
                        onChange={handleChange}
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
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        주소
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 택배를 받아야한다면 이곳에 물건을 받을 주소를 입력해주세요"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                    >
                      프린터 견적 신청하기
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
