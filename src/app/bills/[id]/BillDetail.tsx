'use client';

import { BillDetail as BillDetailType, VoteResult } from '@/types/bill';
import { formatDate } from '@/lib/utils/date';
import VoteMembersView from '@/components/VoteMembersView';
import Link from 'next/link';
import styles from './BillDetail.module.css';
import type { Member22 } from '@/types/member';
import member22Data from '@/data/member22.json';

const { members } = member22Data as { members: Member22[] };

interface BillDetailProps {
  billDetail: BillDetailType;
  voteResult: VoteResult;
  isImportant: boolean;
}

export function BillDetail({ billDetail, voteResult, isImportant }: BillDetailProps) {
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
            <h2 className={styles.sectionTitle}>표결 정보</h2>
            <VoteMembersView
              billId={billId}
              voteResult={voteResult}
              emphasizeAbsent={emphasizeAbsent}
              member22Data={members}
            />
          </div>
        </div>
      </div>
    </div>
  );
}