import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WellcomPlus',
  description: '웰컴플러스 홈페이지',
};

export default function RootLayout({ children }) {
  return (
    <html lang="kr">
      <body className={inter.className}>
        <Navigation />
        <main className="pt-5">{children}</main>
      </body>
    </html>
  );
}
