export const metadata = {
  title: 'A/S 서비스 신청 - 웰컴시스템',
  description:
    '컴퓨터, 노트북, 프린터 A/S 및 수리 서비스. 35년 경험의 전문 기술진이 신속하고 정확한 진단과 수리를 제공합니다.',
  keywords: '컴퓨터 수리, 노트북 수리, 프린터 수리, AS 서비스, 컴퓨터 AS, 하드웨어 수리',
  alternates: {
    canonical: 'https://www.okwellcom.com/userpage/application/as',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'A/S 서비스 신청 - 웰컴시스템',
    description:
      '컴퓨터, 노트북, 프린터 A/S 및 수리 서비스. 35년 경험의 전문 기술진이 신속하고 정확한 수리를 제공합니다.',
    url: 'https://www.okwellcom.com/userpage/application/as',
    type: 'website',
  },
};

export default function ASLayout({ children }) {
  return children;
}
