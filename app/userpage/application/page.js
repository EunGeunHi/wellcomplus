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
      icon: <FaComputer className="w-12 h-12" />,
      link: '/userpage/application/computer',
    },
    {
      id: 2,
      title: '프린터 견적 신청',
      description: '원하는 프린터를 신청하세요',
      icon: <BsFillPrinterFill className="w-12 h-12" />,
      link: '/userpage/application/printer',
    },
    {
      id: 3,
      title: '노트북 견적 신청',
      description: '원하는 노트북을 신청하세요',
      icon: <FaLaptop className="w-12 h-12" />,
      link: '/userpage/application/notebook',
    },
    {
      id: 4,
      title: 'AS 신청',
      description: '제품 수리 및 유지보수 서비스를 신청하세요',
      icon: <FaTools className="w-12 h-12" />,
      link: '/userpage/application/as',
    },
    {
      id: 5,
      title: '기타 문의',
      description: '기타 문의사항을 등록해주세요',
      icon: <FaQuestionCircle className="w-12 h-12" />,
      link: '/userpage/application/inquiry',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/30 to-white font-[NanumGothic]">
      <LoggedInOnlySection fallback={<LoginFallback />}>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center font-[BMJUA] mb-16">
            <h1 className="text-4xl text-gray-900 mb-3">서비스 신청</h1>
            <p className="text-xl text-gray-600">원하시는 서비스를 선택해주세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.id}
                className="relative bg-white/80 rounded-xl shadow-lg overflow-hidden"
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
