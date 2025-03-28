'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaClipboardList, FaTools, FaQuestionCircle } from 'react-icons/fa';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';

export default function ApplicationPage() {
  //최상단으로 스크롤 이동 : 메인페이지에서 서비스 신청 버튼 클릭 시 스크롤 아래로 가있는 현상 때문에 추가
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [hoveredCard, setHoveredCard] = useState(null);

  const services = [
    {
      id: 1,
      title: '견적 신청',
      description: '제품 구매를 위한 맞춤 견적을 신청하세요',
      icon: <FaClipboardList className="w-12 h-12" />,
      link: '/userpage/application/estimate',
    },
    {
      id: 2,
      title: 'AS 신청',
      description: '제품 수리 및 유지보수 서비스를 신청하세요',
      icon: <FaTools className="w-12 h-12" />,
      link: '/userpage/application/service',
    },
    {
      id: 3,
      title: '기타 문의',
      description: '기타 문의사항을 등록해주세요',
      icon: <FaQuestionCircle className="w-12 h-12" />,
      link: '/userpage/application/inquiry',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white font-[NanumGothic]">
      <LoggedInOnlySection
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-blue-100/50 max-w-md w-full">
              <h2 className="text-2xl font-[BMJUA] text-gray-900 mb-4">로그인 후 사용해주세요!</h2>
              <p className="text-gray-600 mb-8">서비스를 이용하기 위해서는 로그인이 필요합니다.</p>
              <Link
                href="/login"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                로그인하기
              </Link>
            </div>
          </div>
        }
      >
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center font-[BMJUA] mb-16">
            <h1 className="text-4xl text-gray-900 mb-4">서비스 신청</h1>
            <p className="text-xl text-gray-600">원하시는 서비스를 선택해주세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.id}
                className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                whileHover={{ scale: 1.03 }}
                onHoverStart={() => setHoveredCard(service.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Link href={service.link}>
                  <div className="p-8 h-full flex flex-col items-center justify-center cursor-pointer">
                    <div
                      className={`text-blue-600 mb-6 transition-transform duration-300 ${
                        hoveredCard === service.id ? 'scale-110' : ''
                      }`}
                    >
                      {service.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                    <p className="text-gray-600 text-center">{service.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </LoggedInOnlySection>
    </div>
  );
}
