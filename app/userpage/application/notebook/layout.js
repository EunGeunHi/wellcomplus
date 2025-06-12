export const metadata = {
  title: '노트북 견적 신청 - 웰컴시스템',
  description:
    '다양한 브랜드 노트북 견적 서비스. 업무용, 게이밍, 학습용 노트북 등 용도별 맞춤 견적을 받아보세요. 전문가 상담으로 최적의 노트북 선택.',
  keywords: '노트북 견적, 노트북 추천, 게이밍 노트북, 업무용 노트북, 학습용 노트북, 노트북 상담',
  alternates: {
    canonical: 'https://www.okwellcom.com/userpage/application/notebook',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: '노트북 견적 신청 - 웰컴시스템',
    description:
      '다양한 브랜드 노트북 견적 서비스. 업무용, 게이밍, 학습용 노트북 등 용도별 맞춤 견적을 받아보세요.',
    url: 'https://www.okwellcom.com/userpage/application/notebook',
    type: 'website',
  },
};

export default function NotebookLayout({ children }) {
  return children;
}
