'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ASApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.itemType.trim() || !formData.description.trim() || !formData.phoneNumber.trim()) {
      toast.error('제품 종류, 문제 설명, 연락처는 \n필수로 입력해야 합니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/applications/as', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('A/S 신청 중 오류가 발생했습니다.');
      }

      toast.success('A/S 신청이 완료되었습니다!');
      // 폼 초기화
      setFormData({
        itemType: '',
        description: '',
        phoneNumber: '',
      });

      // 1초 후 메인 페이지로 이동
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'A/S 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-4xl font-[BMJUA] text-gray-900 mb-4">A/S 신청</h1>
            <p className="text-lg text-gray-600">
              <span className="text-blue-600 font-semibold">상세한 작성</span>을 통해 더 빠른 A/S
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
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">문제 설명</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">
                      {examples.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* A/S 신청 폼 */}
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
                        htmlFor="itemType"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        제품 종류*
                      </label>
                      <select
                        id="itemType"
                        name="itemType"
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        value={formData.itemType}
                        onChange={handleChange}
                      >
                        <option value="">제품 종류를 선택해주세요</option>
                        <option value="computer">컴퓨터</option>
                        <option value="notebook">노트북</option>
                        <option value="printer">프린터</option>
                        <option value="other">기타</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        문제 설명*
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={6}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 제품에 발생한 문제를 자세히 설명해주세요"
                        value={formData.description}
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
                      {isSubmitting ? '신청 중...' : 'A/S 신청하기'}
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
