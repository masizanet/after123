'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { VoteDetail } from '@/components/VoteDetail';
import styles from './BillDetail.module.css';
import type { BillDetail as BillDetailType, VoteResult } from '@/types/bill';
import type { Member22 } from '@/types/member';

interface BillDetailProps {
  billId: string;
  billDetail: BillDetailType;
  voteResult: VoteResult;
  emphasizeAbsent: boolean;
  members: Member22[];
}

export default function BillDetail({ 
  billId,
  billDetail,
  voteResult,
  emphasizeAbsent,
  members
}: BillDetailProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <nav className={styles.navigation}>
          <Link href="/" className={styles.backLink}>
            <svg className={styles.backIcon} viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            목록으로
          </Link>
        </nav>

        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{billDetail.BILL_NM}</h1>
            <div className={styles.grid}>
              <div className={styles.infoGroup}>
                <span className={styles.label}>의안번호</span>
                <span className={styles.value}>{billDetail.BILL_NO}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>제안자</span>
                <span className={styles.value}>{billDetail.PPSR}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>제안일</span>
                <span className={styles.value}>{formatDate(billDetail.PPSL_DT)}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>처리일</span>
                <span className={styles.value}>
                  {formatDate(billDetail.RGS_RSLN_DT)}
                </span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>처리결과</span>
                <span className={styles.value}>{billDetail.RGS_CONF_RSLT}</span>
              </div>
            </div>
          </div>

          <div className={styles.body}>
            <h2 className={styles.sectionTitle}>표결 정보</h2>
            <VoteDetail 
              billId={billId}
              voteResult={voteResult}
              isImportant={emphasizeAbsent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}