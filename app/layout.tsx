import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script'; // ایمپورت کامپوننت اسکریپت نکست‌جی‌اس
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Neon Mini Game',
  description: 'Telegram Mini App Game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}