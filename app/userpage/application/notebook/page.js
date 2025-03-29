'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

export default function NotebookEstimatePage() {
  const [formData, setFormData] = useState({
    modelName: '',
    manufacturer: '',
    brand: '',
    screenSize: '',
    cpuType: '',
    gpuType: '',
    ramSize: '',
    storageSize: '',
    os: '',
    weight: '',
    priceRange: '',
    purpose: '',
    additionalRequests: '',
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
    purpose:
      '- 사무용 문서 작업 및 인터넷 서핑\n- 영상 편집 및 그래픽 작업\n- 게임 및 스트리밍\n- 프로그래밍 개발 작업',
    modelName: '- LG gram 17Z90P\n- Samsung Galaxy Book3 Pro\n- MacBook Pro 16',
    manufacturer: '- LG전자\n- 삼성전자\n- Apple',
    brand: '- gram\n- Galaxy Book\n- MacBook',
    screenSize: '- 13.3인치\n- 15.6인치\n- 17인치',
    cpuType: '- Intel Core i7-1360P\n- AMD Ryzen 9 7940H\n- Apple M2 Pro',
    gpuType:
      '- NVIDIA GeForce RTX 4070\n- AMD Radeon RX 6800S\n- Intel Arc A770M\n- Apple M2 Pro 19코어 GPU',
    weight: '- 1.35kg\n- 1.8kg\n- 2.2kg',
    priceRange: '- 100~150만원\n- 150~200만원\n- 200만원 이상',
    additionalRequests:
      '- 배송 전 성능 테스트 요청\n- 추가 보증기간 필요\n- 파우치나 가방 포함 희망',
  };

  const ramOptions = ['8GB', '16GB', '32GB', '64GB', '128GB 이상'];
  const storageOptions = ['500GB 이하', '1TB', '2TB', '3TB', '4TB 이상'];
  const osOptions = ['Windows 10', 'Windows 11'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-[BMJUA] text-gray-900 mb-4">노트북 견적 신청</h1>
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
                  {Object.entries(examples).map(([key, value]) => (
                    <div key={key} className="bg-blue-50/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        {key === 'purpose'
                          ? '용도'
                          : key === 'modelName'
                            ? '모델명'
                            : key === 'manufacturer'
                              ? '제조사'
                              : key === 'brand'
                                ? '브랜드'
                                : key === 'screenSize'
                                  ? '화면 크기'
                                  : key === 'cpuType'
                                    ? 'CPU 종류'
                                    : key === 'gpuType'
                                      ? 'GPU 칩셋'
                                      : key === 'weight'
                                        ? '무게'
                                        : '추가 요청사항'}
                      </h3>
                      <p className="text-gray-600 whitespace-pre-line text-sm">{value}</p>
                    </div>
                  ))}
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
                        htmlFor="purpose"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        용도*
                      </label>
                      <textarea
                        id="purpose"
                        name="purpose"
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 노트북을 어떤 용도로 사용하실 계획인지 설명해주세요"
                        value={formData.purpose}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="modelName"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        모델명
                      </label>
                      <input
                        type="text"
                        id="modelName"
                        name="modelName"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 노트북이 있다면 모델명을 입력해주세요"
                        value={formData.modelName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="manufacturer"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        제조사
                      </label>
                      <input
                        type="text"
                        id="manufacturer"
                        name="manufacturer"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 제조사가 있다면 입력해주세요"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="brand"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        브랜드
                      </label>
                      <input
                        type="text"
                        id="brand"
                        name="brand"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 브랜드가 있다면 입력해주세요"
                        value={formData.brand}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="screenSize"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        화면 크기
                      </label>
                      <input
                        type="text"
                        id="screenSize"
                        name="screenSize"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 화면 크기가 있다면 입력해주세요 (예: 15.6인치)"
                        value={formData.screenSize}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="cpuType"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        CPU 종류
                      </label>
                      <input
                        type="text"
                        id="cpuType"
                        name="cpuType"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 CPU 종류가 있다면 입력해주세요"
                        value={formData.cpuType}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="gpuType"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        GPU 칩셋
                      </label>
                      <input
                        type="text"
                        id="gpuType"
                        name="gpuType"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 GPU 칩셋이 있다면 입력해주세요"
                        value={formData.gpuType}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-[BMJUA] text-gray-900 mb-4">
                        RAM 용량
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {ramOptions.map((option) => (
                          <div key={option} className="relative">
                            <input
                              type="radio"
                              id={`ram-${option}`}
                              name="ramSize"
                              value={option}
                              className="peer hidden"
                              onChange={handleChange}
                              checked={formData.ramSize === option}
                              required
                            />
                            <label
                              htmlFor={`ram-${option}`}
                              className="block w-full p-3 text-center border-2 rounded-lg cursor-pointer transition-colors
                                peer-checked:border-blue-500 peer-checked:bg-blue-50
                                hover:bg-gray-50 text-sm"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-[BMJUA] text-gray-900 mb-4">
                        저장 용량
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {storageOptions.map((option) => (
                          <div key={option} className="relative">
                            <input
                              type="radio"
                              id={`storage-${option}`}
                              name="storageSize"
                              value={option}
                              className="peer hidden"
                              onChange={handleChange}
                              checked={formData.storageSize === option}
                              required
                            />
                            <label
                              htmlFor={`storage-${option}`}
                              className="block w-full p-3 text-center border-2 rounded-lg cursor-pointer transition-colors
                                peer-checked:border-blue-500 peer-checked:bg-blue-50
                                hover:bg-gray-50 text-sm"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-[BMJUA] text-gray-900 mb-4">
                        운영체제*
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {osOptions.map((option) => (
                          <div key={option} className="relative">
                            <input
                              type="radio"
                              id={`os-${option}`}
                              name="os"
                              value={option}
                              className="peer hidden"
                              onChange={handleChange}
                              checked={formData.os === option}
                              required
                            />
                            <label
                              htmlFor={`os-${option}`}
                              className="block w-full p-3 text-center border-2 rounded-lg cursor-pointer transition-colors
                                peer-checked:border-blue-500 peer-checked:bg-blue-50
                                hover:bg-gray-50 text-sm"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="weight"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        무게
                      </label>
                      <input
                        type="text"
                        id="weight"
                        name="weight"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 무게가 있다면 입력해주세요 (예: 1.35kg)"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="priceRange"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        가격대
                      </label>
                      <input
                        type="text"
                        id="priceRange"
                        name="priceRange"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 원하시는 가격대가 있다면 입력해주세요"
                        value={formData.priceRange}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="additionalRequests"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        추가 요청사항
                      </label>
                      <textarea
                        id="additionalRequests"
                        name="additionalRequests"
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 추가적인 요구사항이나 참고사항을 자유롭게 작성해주세요"
                        value={formData.additionalRequests}
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
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                    >
                      노트북 견적 신청하기
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
