import { BillList } from '@/components/BillList';
import styles from './page.module.css';
import billsData from '@/data/bills.json';

export default function Home() {
  // bills.json에서 의안 목록 생성 및 처리일순 정렬
  const bills = Object.values(billsData)
    .map(bill => ({
      ...bill.detail,
      hasVoteResult: bill.voteResult !== null || bill.detail.BILL_NO === '2206205'
    }))
    .sort((a, b) => {
      // 처리일이 없는 경우 제안일로 대체
      const dateA = new Date(a.RGS_RSLN_DT || a.PPSL_DT);
      const dateB = new Date(b.RGS_RSLN_DT || b.PPSL_DT);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>12.3 내란 관련 주요 의안</h1>
      </header>
      <div className={styles.listWrapper}>
        <BillList bills={bills} />
      </div>
    </div>
  );
}