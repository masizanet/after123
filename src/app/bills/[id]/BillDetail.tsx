'use client';

import { BillDetail, VoteResult } from '@/types/bill';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import styles from './page.module.css';

interface BillDetailProps {
  billDetail: BillDetail;
  voteResult: VoteResult;
}

export function BillDetailContent({ billDetail, voteResult }: BillDetailProps) {
  return (
    <main className={styles.container}>
      <nav className={styles.navigation}>
        <Link href="/" className={styles.backLink}>
          ← 목록으로
        </Link>
      </nav>
      
      <article className={styles.content}>
        <h1>{billDetail.BILL_NM}</h1>
        <dl className={styles.billInfo}>
          <dt>의안번호</dt>
          <dd>{billDetail.BILL_NO}</dd>

          <dt>제안자</dt>
          <dd>{billDetail.PPSR}</dd>

          <dt>제안일</dt>
          <dd>{formatDate(billDetail.PPSL_DT)}</dd>

          <dt>소관위원회</dt>
          <dd>{billDetail.JRCMIT_NM || '-'}</dd>

          {billDetail.JRCMIT_PROC_RSLT && (
            <>
              <dt>소관위원회 처리결과</dt>
              <dd>{billDetail.JRCMIT_PROC_RSLT} ({formatDate(billDetail.JRCMIT_PROC_DT)})</dd>
            </>
          )}

          {billDetail.LAW_PROC_RSLT && (
            <>
              <dt>법사위 처리결과</dt>
              <dd>{billDetail.LAW_PROC_RSLT} ({formatDate(billDetail.LAW_PROC_DT)})</dd>
            </>
          )}

          {billDetail.RGS_CONF_RSLT && (
            <>
              <dt>본회의 심의결과</dt>
              <dd>{billDetail.RGS_CONF_RSLT} ({formatDate(billDetail.RGS_RSLN_DT)})</dd>
            </>
          )}
        </dl>

        {voteResult && (
          <section className={styles.voteResult} aria-labelledby="vote-result-title">
            <h2 id="vote-result-title">표결 결과</h2>
            <div className={styles.voteResultGrid}>
              <div className={styles.voteResultItem}>
                <dt>재적의원</dt>
                <dd>{voteResult.MEMBER_TCNT}명</dd>
              </div>
              <div className={styles.voteResultItem}>
                <dt>총투표수</dt>
                <dd>{voteResult.VOTE_TCNT}명</dd>
              </div>
              <div className={`${styles.voteResultItem} ${styles.voteYes}`}>
                <dt>찬성</dt>
                <dd>{voteResult.YES_TCNT}명</dd>
              </div>
              <div className={`${styles.voteResultItem} ${styles.voteNo}`}>
                <dt>반대</dt>
                <dd>{voteResult.NO_TCNT}명</dd>
              </div>
              <div className={`${styles.voteResultItem} ${styles.voteBlank}`}>
                <dt>기권</dt>
                <dd>{voteResult.BLANK_TCNT}명</dd>
              </div>
            </div>
          </section>
        )}
      </article>
    </main>
  );
}