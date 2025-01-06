import styles from '../page.module.css';
import { PPLEventList } from '@/components/PPLEventList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '12.3 내란 공범자들',
  openGraph: {
    title: '12.3 내란 공범자들',
    description: '2024년 12월 3일 내란 공범자들을 기록합니다.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '12.3 내란 공범자들',
    description: '2024년 12월 3일 내란 공범자들을 기록합니다.',
  }
};

export default function Page() {
return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>내란의 공범자들</h1>
        {/* <p className={styles.description}>표결 정보가 있는 경우에만 추가 정보가 제공됩니다.</p> */}
      </header>
      
      <main>
        <section className={styles.PPLEventList}>
          <PPLEventList  />
        </section>
      </main>
    </div>
  );
}