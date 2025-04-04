'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';

import { useRouter } from 'next/navigation';
import LoginFallback from '@/app/components/LoginFallback';

import { toast } from 'react-hot-toast';

export default function EstimatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    purpose: '',
    budget: '',
    requirements: '',
    additional: '',
    etc: '',
    ponenumber: '',
    address: '',
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
    if (
      !formData.purpose.trim() ||
      !formData.budget.trim() ||
      !formData.requirements.trim() ||
      !formData.ponenumber.trim()
    ) {
      toast.error('사용 목적(용도), 예산, 필수 요구사항, 연락처는 필수로 작성해야 합니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/applications/computer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose: formData.purpose,
          budget: formData.budget,
          requirements: formData.requirements,
          additional: formData.additional,
          etc: formData.etc,
          phoneNumber: formData.ponenumber,
          address: formData.address,
        }),
      });

      if (!response.ok) {
        throw new Error('견적 신청 중 오류가 발생했습니다.');
      }

      toast.success('컴퓨터 견적 신청이 완료되었습니다!');
      // 폼 초기화
      setFormData({
        purpose: '',
        budget: '',
        requirements: '',
        additional: '',
        etc: '',
        ponenumber: '',
        address: '',
      });

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
      '- 배틀그라운드를 할 게임용 컴퓨터\n- 간단한 워드작업을 위한 컴퓨터\n- 어도비 프리미어 프로를 사용한 동영상편집용 컴퓨터\n- 게임, 워드, 엑셀, 프리미어 등 다양한 작업을 할 컴퓨터',
    budget: '- 35만원\n- 예산 범위: 100만원 ~ 200만원',
    requirements:
      '- 그래픽카드는 엔디비아로 해주세요\n- ssd는 삼성 980 pro 2TB로 해주세요\n- 0월 0일까지 컴퓨터 받아야 해요\n- 가성비로견적, 성능중심으로견적 총 2개로 비교견적해주세요',
    additional:
      '- 예산에서 +10만원 정도는 괜찮아요\n- 될 수 있으면 최대한 빨리 해주세요\n- 예산이 남으면 가성비좋은 키보드 하나 추가해주세요',
    etc: '궁금한점 또는 컴퓨터 견적에 참고했으면 하는 사항을 자유롭게 작성해주세요',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-[NanumGothic]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-[BMJUA] text-gray-900 mb-4">컴퓨터 견적 신청</h1>
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
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">사용 목적(용도)</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{examples.purpose}</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">예산</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{examples.budget}</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <div className="flex flex-col mb-3">
                      <h3 className="text-lg font-semibold text-blue-800 mb-1">필수 요구사항</h3>
                      <div className="inline-flex items-center text-xs px-3 py-1 bg-blue-100/50 rounded-full w-fit">
                        <span className="text-blue-700">
                          ✓ 꼭 견적에 반영되어야 할 것들을 작성해주세요
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">
                        {examples.requirements}
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <div className="flex flex-col mb-3">
                      <h3 className="text-lg font-semibold text-blue-800 mb-1">추가 요구사항</h3>
                      <div className="inline-flex items-center text-xs px-3 py-1 bg-blue-100/50 rounded-full w-fit">
                        <span className="text-blue-700">
                          ✓ 견적에 반영되면 좋고 아니여도 괜찮은 것들을 작성해주세요
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 whitespace-pre-line text-sm">
                      {examples.additional}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">기타 사항</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{examples.etc}</p>
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
                        htmlFor="purpose"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        사용 목적(용도)*
                      </label>
                      <textarea
                        id="purpose"
                        name="purpose"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 컴퓨터 사용 목적을 자유롭게 작성해주세요"
                        value={formData.purpose}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="budget"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        예산*
                      </label>
                      <textarea
                        type="text"
                        id="budget"
                        name="budget"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 예산 범위를 입력해주세요"
                        value={formData.budget}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="requirements"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        필수 요구사항*
                      </label>
                      <textarea
                        id="requirements"
                        name="requirements"
                        rows={7}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 꼭 견적에 반영되어야 할 것들을 작성해주세요"
                        value={formData.requirements}
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
                        rows={6}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 추가적인 요구사항이나 참고사항을 자유롭게 작성해주세요"
                        value={formData.additional}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="etc"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        기타 사항
                      </label>
                      <textarea
                        id="etc"
                        name="etc"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(선택) 궁금한점 또는 컴퓨터 견적에 참고했으면 하는 사항을 자유롭게 작성해주세요"
                        value={formData.etc}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="ponenumber"
                        className="block text-lg font-[BMJUA] text-gray-900 mb-2"
                      >
                        연락처*
                      </label>
                      <textarea
                        id="ponenumber"
                        name="ponenumber"
                        rows={1}
                        className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(필수) 해당 번호로 연락을 드리므로 정확하게 입력해주세요."
                        value={formData.ponenumber}
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
                      {isSubmitting ? '신청 중...' : '컴퓨터 견적 신청하기'}
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
