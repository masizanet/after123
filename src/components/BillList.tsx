'use client';

import { useEffect, useState } from 'react';
import { fetchVoteResult, BILL_2206205_ID } from '@/lib/api/bills';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import styles from './BillList.module.css';
import type { Bill } from '@/types/bill';

interface BillListProps {
  bills: Bill[];
}

interface BillWithVote extends Bill {
  hasVoteResult?: boolean;
}

export function BillList({ bills }: BillListProps) {
  const [billsWithVote, setBillsWithVote] = useState<BillWithVote[]>(bills);

  useEffect(() => {
    // console.log('Initial bills:', bills); // Debug log

    async function checkVoteResults() {
      const votesChecked = await Promise.all(
        bills.map(async (bill) => {
          // Debug log for each bill
          // console.log('Processing bill:', {
          //   id: bill.BILL_ID,
          //   name: bill.BILL_NM,
          //   procDt: bill.PROC_DT,
          //   procResult: bill.PROC_RESULT,
          //   proposeDate: bill.PROPOSE_DT,
          //   billKind: bill.BILL_KIND
          // });

          if (bill.BILL_ID === BILL_2206205_ID || 
              bill.BILL_ID.includes('2206205') || 
              bill.BILL_ID === 'PRC_V2Y4M1J2X0P9Y1S8X3P8L2H5K0C5R1') {
            return {
              ...bill,
              hasVoteResult: true
            };
          }

          const voteResult = await fetchVoteResult(bill.BILL_ID);
          return {
            ...bill,
            hasVoteResult: voteResult !== null
          };
        })
      );
      setBillsWithVote(votesChecked);
    }

    checkVoteResults();
  }, [bills]);


  return (
    <ul className={styles.list}>
      {billsWithVote.map((bill) => (
        <li key={bill.BILL_ID} className={styles.item}>
          <div className={styles.info}>
            <div className={styles.header}>
              <h2 className={styles.title}>{bill.BILL_NM}</h2>
              <div className={styles.actions}>
                <a
                  href={`http://likms.assembly.go.kr/bill/billDetail.do?billId=${bill.BILL_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.button}
                >
                  원본 보기
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
            
            <dl className={styles.details}>
              <div className={styles.row}>
                <dt className={styles.label}>종류</dt>
                <dd className={styles.value}>{bill.BILL_KND}</dd>
              </div>

              <div className={styles.row}>
                <dt className={styles.label}>제안일</dt>
                <dd className={styles.value}>{formatDate(bill.PPSL_DT)}</dd>
              </div>

              <div className={styles.row}>
                <dt className={styles.label}>처리일</dt>
                <dd className={styles.value}>{bill.RGS_RSLN_DT ? formatDate(bill.RGS_RSLN_DT) : '-'}</dd>
              </div>

              <div className={styles.row}>
                <dt className={styles.label}>처리결과</dt>
                <dd className={styles.resultRow}>
                  <span className={styles.value}>{bill.RGS_CONF_RSLT || '-'}</span>
                  {bill.hasVoteResult && (
                    <Link
                      href={`/bills/${bill.BILL_ID}`}
                      className={styles.button}
                    >
                      자세히 보기
                      <svg 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}