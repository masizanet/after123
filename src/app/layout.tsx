import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from '@/components/Footer';
import styles from './layout.module.css';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: '123 내란 관련 주요 의안',
  description: '의안 표결 결과 및 관련 정보 모음',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className={styles.wrapper}>
          <main className={styles.main}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}