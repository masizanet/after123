import { BillList } from '@/components/BillList';
import styles from './page.module.css';
import billsData from '@/data/bills.json';
import { Bill } from '@/types/bill';
import Link from 'next/link';

export default function Home() {
  // bills.json에서 의안 목록 생성 및 처리일순 정렬
  const bills = Object.values(billsData)
    .map(bill => ({
      ...bill.detail,
      BILL_KND: '',
      PPSR_KND: '',
      PPSR_NM: '',
      LINK_URL: '',
      hasVoteResult: bill.voteResult !== null || bill.detail.BILL_NO === '2206205'
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
        <p className={styles.description}>표결 정보가 있는 경우에만 상세 정보가 제공됩니다.</p>
      </header>
      
      <main>
        <section className={styles.billsSection}>
          <ul className={styles.billList}>
            {bills.map(bill => (
              <li key={bill.BILL_ID} className={styles.billItem}>
                <div className={styles.billLink}>
                  <h2 className={styles.billTitle}>{bill.BILL_NM}</h2>
                  <dl className={styles.billMeta}>
                    <div className={styles.metaItem}>
                      <dt>제안</dt>
                      <dd>{bill.PPSR}</dd>
                    </div>
                    <div className={styles.metaItem}>
                      <dt>처리결과</dt>
                      <dd>{bill.RGS_CONF_RSLT || '계류중'}</dd>
                    </div>
                  </dl>
                  {bill.hasVoteResult && (
                    <Link 
                      href={`/bills/${bill.BILL_ID}`} 
                      className={styles.detailButton}
                    >
                      표결 정보 보기 →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}