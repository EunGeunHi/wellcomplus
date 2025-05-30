'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  FiInfo,
  FiPhone,
  FiHome,
  FiMonitor,
  FiCpu,
  FiLayers,
  FiDollarSign,
  FiActivity,
  FiShoppingBag,
  FiMessageSquare,
} from 'react-icons/fi';
import { FaUserPen } from 'react-icons/fa6';
import { GoDatabase } from 'react-icons/go';
import { GrSystem } from 'react-icons/gr';
import { RiWeightFill } from 'react-icons/ri';
import { LuClipboardPlus } from 'react-icons/lu';
import { AiFillPrinter } from 'react-icons/ai';
import { MdClass, MdOutlineSubtitles } from 'react-icons/md';

const MotionCard = memo(({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: delay }}
    className={className}
  >
    {children}
  </motion.div>
));

const InfoCard = memo(({ icon: Icon, title, value, className = '' }) => (
  <motion.div
    className={`bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200 shadow-sm ${className}`}
    whileHover={{
      scale: 1.02,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="text-slate-500" size={14} />
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
    </div>
    <p className="text-gray-700 text-sm whitespace-pre-wrap">{value || '-'}</p>
  </motion.div>
));

const ComputerDetails = memo(({ information }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    <InfoCard icon={FaUserPen} title="용도" value={information.purpose} />
    <InfoCard icon={FiDollarSign} title="예산" value={information.budget} />
    <InfoCard icon={FiCpu} title="CPU" value={information.cpu} />
    <InfoCard icon={FiMonitor} title="GPU" value={information.gpu} />
    <InfoCard icon={FiLayers} title="메모리" value={information.memory} />
    <InfoCard icon={GoDatabase} title="저장장치" value={information.storage} />
    <InfoCard icon={FiActivity} title="쿨러" value={information.cooling} />
    <InfoCard icon={GrSystem} title="운영체제" value={information.os} />
    <InfoCard icon={FiPhone} title="연락처" value={information.phoneNumber} />
    <InfoCard icon={FiShoppingBag} title="수령방법" value={information.deliveryMethod} />

    {information.address && (
      <InfoCard
        icon={FiHome}
        title="주소"
        value={information.address}
        className="col-span-2 md:col-span-3"
      />
    )}

    {information.additionalRequests && (
      <InfoCard
        icon={LuClipboardPlus}
        title="추가 요청사항"
        value={information.additionalRequests}
        className="col-span-2 md:col-span-3"
      />
    )}
  </div>
));

const PrinterDetails = memo(({ information }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    <InfoCard icon={FaUserPen} title="용도" value={information.purpose} />
    <InfoCard icon={FiDollarSign} title="예산" value={information.budget} />
    <InfoCard icon={AiFillPrinter} title="프린터 종류" value={information.printerType} />
    <InfoCard icon={FiActivity} title="무한잉크젯" value={information.infiniteInk} />
    <InfoCard icon={FiMonitor} title="출력색상" value={information.outputColor} />
    <InfoCard icon={FiPhone} title="연락처" value={information.phoneNumber} />
    <InfoCard icon={FiShoppingBag} title="수령방법" value={information.deliveryMethod} />

    {information.address && (
      <InfoCard
        icon={FiHome}
        title="주소"
        value={information.address}
        className="col-span-2 md:col-span-3"
      />
    )}

    {information.additionalRequests && (
      <InfoCard
        icon={LuClipboardPlus}
        title="추가 요청사항"
        value={information.additionalRequests}
        className="col-span-2 md:col-span-3"
      />
    )}
  </div>
));

const NotebookDetails = memo(({ information }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    <InfoCard icon={FaUserPen} title="용도" value={information.purpose} />
    <InfoCard icon={FiDollarSign} title="예산" value={information.budget} />
    <InfoCard icon={FiCpu} title="CPU" value={information.cpu} />
    <InfoCard icon={FiMonitor} title="GPU" value={information.gpu} />
    <InfoCard icon={RiWeightFill} title="무게" value={information.weight} />
    <InfoCard icon={GrSystem} title="운영체제" value={information.os} />
    <InfoCard icon={FiLayers} title="RAM" value={information.ram} />
    <InfoCard icon={GoDatabase} title="저장장치" value={information.storage} />
    <InfoCard icon={FiPhone} title="연락처" value={information.phoneNumber} />
    <InfoCard icon={FiShoppingBag} title="수령방법" value={information.deliveryMethod} />

    {information.address && (
      <InfoCard
        icon={FiHome}
        title="주소"
        value={information.address}
        className="col-span-2 md:col-span-3"
      />
    )}

    {information.additionalRequests && (
      <InfoCard
        icon={LuClipboardPlus}
        title="추가 요청사항"
        value={information.additionalRequests}
        className="col-span-2 md:col-span-3"
      />
    )}
  </div>
));

const AsDetails = memo(({ information }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
    <InfoCard icon={MdClass} title="A/S 분류" value={information.asCategory} />

    {information.userName && (
      <InfoCard icon={FaUserPen} title="사용자 이름" value={information.userName} />
    )}

    {information.pcNumber && (
      <InfoCard icon={FiInfo} title="PC 번호" value={information.pcNumber} />
    )}

    {information.printerType && (
      <InfoCard icon={AiFillPrinter} title="프린터 종류" value={information.printerType} />
    )}

    {information.infiniteInk && (
      <InfoCard icon={FiActivity} title="무한잉크젯" value={information.infiniteInk} />
    )}

    <InfoCard icon={FiPhone} title="연락처" value={information.phoneNumber} />

    {information.deliveryMethod && (
      <InfoCard icon={FiShoppingBag} title="수령방법" value={information.deliveryMethod} />
    )}

    {information.address && (
      <InfoCard
        icon={FiHome}
        title="주소"
        value={information.address}
        className="col-span-1 md:col-span-2"
      />
    )}

    <InfoCard
      icon={FiMessageSquare}
      title="상세 설명"
      value={information.description}
      className="col-span-1 md:col-span-2"
    />
  </div>
));

const InquiryDetails = memo(({ information }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
    <InfoCard icon={MdOutlineSubtitles} title="제목" value={information.title} />
    <InfoCard icon={FiPhone} title="연락처" value={information.phoneNumber} />
    <InfoCard
      icon={FiMessageSquare}
      title="내용"
      value={information.content}
      className="col-span-1 md:col-span-2"
    />
  </div>
));

const ApplicationDetails = memo(({ application, delay = 0.3 }) => {
  const renderDetails = () => {
    switch (application.type) {
      case 'computer':
        return application.computer_information ? (
          <ComputerDetails information={application.computer_information} />
        ) : null;
      case 'printer':
        return application.printer_information ? (
          <PrinterDetails information={application.printer_information} />
        ) : null;
      case 'notebook':
        return application.notebook_information ? (
          <NotebookDetails information={application.notebook_information} />
        ) : null;
      case 'as':
        return application.as_information ? (
          <AsDetails information={application.as_information} />
        ) : null;
      case 'inquiry':
        return application.inquiry_information ? (
          <InquiryDetails information={application.inquiry_information} />
        ) : null;
      default:
        return <div className="text-gray-500">상세 정보가 없습니다.</div>;
    }
  };

  return (
    <MotionCard
      className="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-500"
      delay={delay}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-indigo-100 rounded-lg">
          <FiInfo className="text-indigo-600" size={16} />
        </div>
        <h2 className="text-lg font-bold text-gray-900">상세 내용</h2>
      </div>

      <div className="space-y-4">{renderDetails()}</div>
    </MotionCard>
  );
});

ApplicationDetails.displayName = 'ApplicationDetails';
MotionCard.displayName = 'MotionCard';
InfoCard.displayName = 'InfoCard';
ComputerDetails.displayName = 'ComputerDetails';
PrinterDetails.displayName = 'PrinterDetails';
NotebookDetails.displayName = 'NotebookDetails';
AsDetails.displayName = 'AsDetails';
InquiryDetails.displayName = 'InquiryDetails';

export default ApplicationDetails;
