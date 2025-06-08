export const metadata = {
  title: '기타 문의 - WellComSystem',
  description: '웰컴시스템 기타 문의 페이지. 컴퓨터 관련 궁금한 사항을 문의해주세요.',
  alternates: {
    canonical: 'https://www.okwellcom.com/userpage/application/inquiry',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: '기타 문의 - WellComSystem',
    description: '웰컴시스템 기타 문의 페이지. 컴퓨터 관련 궁금한 사항을 문의해주세요.',
    url: 'https://www.okwellcom.com/userpage/application/inquiry',
  },
};

export default function InquiryLayout({ children }) {
  return children;
}
