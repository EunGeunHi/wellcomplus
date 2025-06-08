'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaTools, FaQuestionCircle, FaLaptop } from 'react-icons/fa';
import { BsFillPrinterFill } from 'react-icons/bs';
import { FaComputer } from 'react-icons/fa6';
import { LoggedInOnlySection } from '@/app/components/ProtectedContent';
import LoginFallback from '@/app/components/LoginFallback';

export default function ApplicationPage() {
  //최상단으로 스크롤 이동 : 메인페이지에서 서비스 신청 버튼 클릭 시 스크롤 아래로 가있는 현상 때문에 추가
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [hoveredCard, setHoveredCard] = useState(null);

  const services = [
    {
      id: 1,
      title: 'PC 견적 신청',
      description: 'PC 구매를 위한 맞춤 견적을 신청하세요',
      icon: <FaComputer className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      link: '/userpage/application/computer',
    },
    {
      id: 2,
      title: '프린터 견적 신청',
      description: '원하는 프린터를 신청하세요',
      icon: <BsFillPrinterFill className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      link: '/userpage/application/printer',
    },
    {
      id: 3,
      title: '노트북 견적 신청',
      description: '원하는 노트북을 신청하세요',
      icon: <FaLaptop className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      link: '/userpage/application/notebook',
    },
    {
      id: 4,
      title: 'AS 신청',
      description: '제품 수리 및 유지보수 서비스를 신청하세요',
      icon: <FaTools className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      link: '/userpage/application/as',
    },
    {
      id: 5,
      title: '기타 문의',
      description: '기타 문의사항을 등록해주세요',
      icon: <FaQuestionCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      link: '/userpage/application/inquiry',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white font-[NanumGothic]">
      {/* SEO를 위한 정적 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16 sm:px-6 lg:px-8">
        <div className="text-center font-[BMJUA] mb-1 sm:mb-3 lg:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-2 sm:mb-3">
            웰컴시스템 서비스 신청
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            PC, 노트북, 프린터 견적부터 A/S까지 모든 컴퓨터 서비스를 한 곳에서
          </p>

          {/* SEO용 서비스 설명 - 사용자에게는 보이지 않음 */}
          <div className="sr-only">
            <p>
              웰컴시스템은 35년 전통의 컴퓨터 전문점으로 PC 견적, 노트북 견적, 프린터 견적 신청
              서비스와 전문적인 A/S 서비스를 제공합니다. 게임용 PC부터 사무용 컴퓨터까지 고객 맞춤형
              견적을 받아보세요.
            </p>
          </div>
        </div>

        {/* 서비스 목록 - 정적 버전 (검색엔진용) */}
        <div className="sr-only">
          <h2>제공 서비스</h2>
          <ul>
            <li>PC 견적 신청 - 맞춤형 컴퓨터 견적 서비스</li>
            <li>프린터 견적 신청 - 다양한 프린터 모델 견적</li>
            <li>노트북 견적 신청 - 용도별 노트북 추천</li>
            <li>AS 신청 - 컴퓨터 수리 및 유지보수</li>
            <li>기타 문의 - 컴퓨터 관련 상담</li>
          </ul>
        </div>
      </div>

      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-7xl mx-auto px-4 pb-8 sm:pb-12 lg:pb-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {services.map((service) => (
              <motion.div
                key={service.id}
                className="relative bg-white/80 rounded-xl shadow-lg overflow-hidden"
                whileHover={{ scale: 1.03 }}
                onHoverStart={() => setHoveredCard(service.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Link href={service.link}>
                  <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col items-center justify-center cursor-pointer min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]">
                    <div
                      className={`text-blue-600 mb-3 sm:mb-4 lg:mb-6 transition-transform duration-300 ${
                        hoveredCard === service.id ? 'scale-110' : ''
                      }`}
                    >
                      {service.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4 text-center">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed">
                      {service.description}
                    </p>
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
