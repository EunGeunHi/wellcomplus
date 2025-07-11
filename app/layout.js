import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';
import { AuthProvider } from './components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://www.okwellcom.com'),
  title: '웰컴시스템 - 35년 기술과 노하우를 더하다',
  description:
    '웰컴시스템 컴퓨터 전문점 - 컴퓨터, 프린터 개조 및 수리, 노트북, A/S 서비스. 믿을 수 있는 컴퓨터 전문가와 함께하세요.',
  keywords: [
    '웰컴',
    '웰컴컴퓨터',
    '웰컴시스템',
    'WellCom',
    'WellComSystem',
    '컴퓨터',
    '노트북',
    '프린터',
    'A/S',
    '견적',
    '컴퓨터전문점',
    '컴퓨터수리',
  ],
  authors: [{ name: 'WellComSystem' }],
  creator: 'WellComSystem',
  publisher: 'WellComSystem',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.okwellcom.com',
    siteName: '웰컴시스템 - 35년 기술과 노하우를 더하다',
    title: '웰컴시스템 - 35년 기술과 노하우를 더하다',
    description:
      '웰컴시스템 컴퓨터 전문점 - 컴퓨터, 프린터 개조 및 수리, 노트북, A/S 서비스. 믿을 수 있는 컴퓨터 전문가와 함께하세요.',
    images: [
      {
        url: '/og-image.jpg', // 대표 이미지 (1200x630 권장)
        width: 1200,
        height: 630,
        alt: 'WellComSystem 웰컴시스템 컴퓨터 전문점',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WellComSystem - 웰컴시스템 컴퓨터 전문점',
    description: '웰컴시스템 컴퓨터 전문점 - 컴퓨터, 노트북, 프린터 견적 및 A/S 서비스',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google3092aeac45bedd63', // Google Search Console 인증 코드
    naver: 'naver095b3eb8ab67922ccc4d8eb89d689d95', // 네이버 웹마스터 도구 인증 코드
  },
  alternates: {
    canonical: 'https://www.okwellcom.com',
  },
};

/**
 * 루트 레이아웃 컴포넌트
 *
 * 모든 페이지에 공통으로 적용되는 레이아웃 구성
 * AuthProvider로 감싸 전체 앱에 인증 기능 제공
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 페이지 컴포넌트
 */
export default function RootLayout({ children }) {
  return (
    <html lang="kr">
      <head>
        {/* 중요 폰트 Preload - FCP 성능 최적화 */}
        <link
          rel="preload"
          href="/font/BMJUA_ttf.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/font/NANUMGOTHIC.OTF"
          as="font"
          type="font/opentype"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/font/SHILLA_CULTURE(M).TTF"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        {/* Auth.js 세션 제공자로 앱 전체 래핑 */}
        <AuthProvider>
          <Navigation />
          <main className="pt-20">{children}</main>
        </AuthProvider>
        <Toaster position="top-center" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
