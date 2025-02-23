import styles from './page.module.css';
import billsData from '@/data/bills.json';
import { Bill } from '@/types/bill';
import { BillList } from '@/components/BillList';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '12.3 내란 관련 주요 의안',
  description: '2024년 12월 3일 내란 관련 주요 의안 정보와 표결 정보를 제공합니다.',
  openGraph: {
    title: '12.3 내란 관련 주요 의안',
    description: '2024년 12월 3일 내란 관련 주요 의안 정보와 표결 정보를 제공합니다.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '12.3 내란 관련 주요 의안',
    description: '2024년 12월 3일 내란 관련 주요 의안 정보와 표결 정보를 제공합니다.',
  }
};

export default function Home() {
  // bills.json에서 의안 목록 생성 및 처리일순 정렬
  const bills = Object.values(billsData)
    .map(bill => ({
      ...bill.detail,
      BILL_KND: '',
      PPSR_KND: '',
      PPSR_NM: '',
      LINK_URL: '',
      hasVoteResult: bill.voteResult !== null && bill.detail.BILL_NO !== '2206205'
    }))
    .sort((a, b) => {
      // 처리일이 없는 경우 제안일로 대체
      const dateA = new Date(a.RGS_RSLN_DT || a.PPSL_DT);
      const dateB = new Date(b.RGS_RSLN_DT || b.PPSL_DT);
      return dateB.getTime() - dateA.getTime();
    }) as Bill[];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>12.3 내란 관련 주요 의안</h1>
        <p className={styles.description}>목록은 비정기 갱신 중. 표결 정보는 있는 경우에만 표시됩니다.</p>
      </header>
      
      <main>
        <section className={styles.billsSection}>
          <BillList bills={bills} />
        </section>
        <section className={styles.otherLink}>
          <Link href="/accomplice">공범자들 &gt;</Link>
        </section>
      </main>
    </div>
  );
}