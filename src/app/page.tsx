import { fetchTrackedBills } from '@/lib/api/bills';
import styles from './page.module.css';
import { BillList } from '@/components/BillList';

export default async function Home() {
  const { bills } = await fetchTrackedBills();
  
  const sortedBills = [...bills].sort((a, b) => {
    const dateA = new Date(a.PPSL_DT);
    const dateB = new Date(b.PPSL_DT);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <main className={styles.main}>
      <h1>12.3 내란 관련 주요 의안</h1>
      <BillList bills={sortedBills} />
    </main>
  );
}