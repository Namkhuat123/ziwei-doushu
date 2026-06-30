import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Tử Vi Đẩu Số · Lập Lá Số Chính Thống Ni Hải Hạ',
  description: 'Hệ thống lập lá số Tử Vi Đẩu Số chính thống theo thể thức Ni Hải Hạ, AI giải đọc sâu mệnh bàn, đại hạn, lưu niên, tình duyên, sự nghiệp, tài vận, sức khỏe toàn diện',
  keywords: 'Tử Vi Đẩu Số, tử vi, lá số tử vi, Ni Hải Hạ, Thiên Kỷ, mệnh bàn, 14 chính tinh, 12 cung tử vi, xem tử vi, lập lá số',
  metadataBase: new URL('https://wdyziweidoushu666.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tử Vi Đẩu Số · Lập Lá Số Chính Thống Ni Hải Hạ',
    description: 'Hệ thống lập lá số Tử Vi Đẩu Số chính thống theo thể thức Ni Hải Hạ, AI giải đọc sâu mệnh bàn, đại hạn lưu niên toàn diện',
    url: 'https://wdyziweidoushu666.com',
    siteName: 'Tử Vi Nghiên Cứu',
    locale: 'vi_VN',
    type: 'website',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '808FFC6023A2C359B375DD860FEDA856',
      'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_VERIFICATION || '',
      '360-site-verification': process.env.NEXT_PUBLIC_360_SITE_VERIFICATION || '',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
