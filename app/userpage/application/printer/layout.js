export const metadata = {
  title: '프린터 견적 신청 - 웰컴시스템',
  description:
    '프린터 전문 견적 서비스. 사무용, 포토프린터, 대형 프린터 등 용도별 맞춤 견적을 받아보세요. 무한잉크젯, 레이저프린터 전문 상담.',
  keywords:
    '프린터 견적, 프린터 추천, 사무용 프린터, 포토프린터, 무한잉크젯, 레이저프린터, 프린터 설치',
  alternates: {
    canonical: 'https://www.okwellcom.com/userpage/application/printer',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: '프린터 견적 신청 - 웰컴시스템',
    description:
      '프린터 전문 견적 서비스. 사무용, 포토프린터, 대형 프린터 등 용도별 맞춤 견적을 받아보세요.',
    url: 'https://www.okwellcom.com/userpage/application/printer',
    type: 'website',
  },
};

export default function PrinterLayout({ children }) {
  return children;
}
