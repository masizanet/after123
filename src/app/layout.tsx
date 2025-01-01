import type { Metadata } from "next";
import { Footer } from '@/components/Footer';
import styles from './layout.module.css';
import "./globals.css";

export const metadata: Metadata = {
  title: '12.3 내란 관련 주요 의안',
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