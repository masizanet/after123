'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VoteDetail } from '@/components/VoteDetail';
import styles from './page.module.css';
import type { BillDetail as BillDetailType, VoteResult } from '@/types/bill';

interface Props {
  detail: BillDetailType;
  voteResult: VoteResult | null;
  isImportant?: boolean;
}

export default function BillDetail({ detail, voteResult, isImportant = false }: Props) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <nav className={styles.navigation}>
        <div className={styles.navButtons}>
          <button onClick={() => router.back()} className={styles.backButton}>
            ← 이전 페이지
          </button>
          <Link href="/" className={styles.homeButton}>
            홈으로
          </Link>
        </div>
      </nav>

      <main className={styles.content}>
        <article>
          <header className={styles.header}>
            <h1 className={styles.title}>{detail.BILL_NM}</h1>
            <dl className={styles.meta}>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>제안</dt>
                <dd className={styles.metaValue}>{detail.PPSR} ({detail.PPSL_DT})</dd>
              </div>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>소관위원회</dt>
                <dd className={styles.metaValue}>{detail.JRCMIT_NM}</dd>
              </div>
              {detail.PROC_RESULT_CD && (
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>처리결과</dt>
                  <dd className={styles.metaValue}>{detail.PROC_RESULT_CD}</dd>
                </div>
              )}
            </dl>
          </header>

          {voteResult && (
            <VoteDetail 
              billId={detail.BILL_ID} 
              voteResult={voteResult}
              isImportant={isImportant}
            />
          )}
        </article>
      </main>
    </div>
  );
}