// src/app/bills/[id]/BillDetail.tsx
'use client';

import { BillDetail as BillDetailType, VoteResult } from '@/types/bill';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import VoteMembersView from '@/components/VoteMembersView';
import { BILL_METADATA } from '@/constants/bills';
import styles from './BillDetail.module.css';

interface BillDetailProps {
  billDetail: BillDetailType;
  voteResult: VoteResult;
  isImportant: boolean;
}

export function BillDetail({ billDetail, voteResult, isImportant }: BillDetailProps) {
  const metadata = BILL_METADATA[billDetail.BILL_ID];
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <nav className={styles.navigation}>
          <Link href="/" className={styles.backLink}>
            <svg 
              className={styles.backIcon}
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
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
                <span className={styles.label}>소관위원회</span>
                <span className={styles.value}>{billDetail.JRCMIT_NM || '-'}</span>
              </div>

              {billDetail.JRCMIT_PROC_RSLT && (
                <div className={styles.infoGroup}>
                  <span className={styles.label}>소관위원회 처리결과</span>
                  <span className={styles.value}>
                    {billDetail.JRCMIT_PROC_RSLT}
                    <span className={styles.date}>
                      ({formatDate(billDetail.JRCMIT_PROC_DT)})
                    </span>
                  </span>
                </div>
              )}

              {billDetail.RGS_CONF_RSLT && (
                <div className={styles.infoGroup}>
                  <span className={styles.label}>본회의 심의결과</span>
                  <span className={styles.value}>
                    {billDetail.RGS_CONF_RSLT}
                    <span className={styles.date}>
                      ({formatDate(billDetail.RGS_RSLN_DT)})
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.body}>
            <h2 className={styles.sectionTitle}>표결 현황</h2>
            <VoteMembersView 
              billId={billDetail.BILL_ID}
              voteResult={voteResult}
              isImportant={isImportant}
              emphasizeAbsent={metadata?.emphasizeAbsent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}