export const metadata = {
  title: '회원가입 - WellComSystem',
  description:
    '웰컴시스템 회원가입 페이지. 간편하게 회원가입하고 다양한 컴퓨터 서비스를 이용하세요.',
  alternates: {
    canonical: 'https://www.okwellcom.com/signup',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: '회원가입 - WellComSystem',
    description:
      '웰컴시스템 회원가입 페이지. 간편하게 회원가입하고 다양한 컴퓨터 서비스를 이용하세요.',
    url: 'https://www.okwellcom.com/signup',
  },
};

export default function SignupLayout({ children }) {
  return children;
}
