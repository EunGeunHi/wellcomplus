import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthProvider } from './components/AuthProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WellcomPlus',
  description: '웰컴플러스 홈페이지',
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
      <body className={inter.className}>
        {/* Auth.js 세션 제공자로 앱 전체 래핑 */}
        <AuthProvider>
          <Navigation />
          <main className="pt-20">{children}</main>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
