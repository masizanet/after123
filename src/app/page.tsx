import { BillList } from '@/components/BillList';
import { fetchTrackedBills } from '@/lib/api/bills';
import styles from './page.module.css';

export default async function Home() {
  const { bills } = await fetchTrackedBills();
  const sortedBills = [...bills].sort((a, b) => {
    const dateA = new Date(a.PPSL_DT);
    const dateB = new Date(b.PPSL_DT);
    return dateB.getTime() - dateA.getTime();
  });


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>12.3 내란 관련 주요 의안</h1>
      </header>
      <div className={styles.listWrapper}>
        <BillList bills={sortedBills} />
      </div>
    </div>
  );
}