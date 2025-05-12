'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';
import { FiX, FiPaperclip, FiAlertCircle } from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NotebookEstimatePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (!formData.purpose.trim() || !formData.os || !formData.phoneNumber.trim()) {
      toast.error('용도, 운영체제, 연락처는 \n필수로 선택해야 합니다.');
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

      const response = await fetch('/api/applications/notebook', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!response.ok) {
        throw new Error('견적 신청 중 오류가 발생했습니다.');
      }

      toast.success('노트북 견적 신청이 완료되었습니다!');
      // 폼 초기화
      setFormData({
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
      setSelectedFiles([]);
      setTotalFileSize(0);

      // 3초 후 메인 페이지로 이동
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || '견적 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
                            참고할 파일이 있으면 업로드해주세요
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
                    <p className="text-gray-500 text-sm text-center mb-4 bg-yellow-50/50 py-2 px-4 rounded-lg border border-yellow-100">
                      ⚠️ 부품 수급상황에 따라 요구사항이 모두 수용되지 않을 수 있습니다.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full font-[NanumGothic] text-xl font-bold text-white py-4 px-6 rounded-lg transition-colors duration-200 ${
                        isSubmitting
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {isSubmitting ? '신청 중...' : '노트북 견적 신청하기'}
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
