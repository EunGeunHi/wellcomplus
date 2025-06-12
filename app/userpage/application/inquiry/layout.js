export const metadata = {
  title: '기타 문의 - 웰컴시스템',
  description:
    'IT 관련 궁금한 사항, 서비스 문의, 기술 상담 등 언제든지 문의하세요. 35년 경험의 전문가가 친절하게 답변해드립니다.',
  keywords: '컴퓨터 문의, IT 상담, 기술 지원, 서비스 문의, 컴퓨터 질문, AS 문의',
  alternates: {
    canonical: 'https://www.okwellcom.com/userpage/application/inquiry',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: '기타 문의 - 웰컴시스템',
    description:
      'IT 관련 궁금한 사항, 서비스 문의, 기술 상담 등 언제든지 문의하세요. 35년 경험의 전문가가 답변해드립니다.',
    url: 'https://www.okwellcom.com/userpage/application/inquiry',
    type: 'website',
  },
};

export default function InquiryLayout({ children }) {
  return children;
}
