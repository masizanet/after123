'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bill } from '@/types/bill';
import { fetchVoteResult, BILL_2206205_ID } from '@/lib/api/bills';
import styles from '@/app/page.module.css';

interface BillListProps {
  bills: Bill[];
}

interface BillWithVote extends Bill {
  hasVoteResult?: boolean;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function getStatusClass(result: string | null): string {
  if (!result) return styles.statusPending;
  if (result.includes('가결')) return styles.statusPassed;
  if (result.includes('부결')) return styles.statusRejected;
  return styles.statusPending;
}

export function BillList({ bills }: BillListProps) {
  const [billsWithVote, setBillsWithVote] = useState<BillWithVote[]>(bills);

  useEffect(() => {
    async function checkVoteResults() {
      const votesChecked = await Promise.all(
        bills.map(async (bill) => {
          // 2206205 법안 체크
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
    <div className={styles.billList}>
      {billsWithVote.map((bill) => (
        <article 
          key={bill.BILL_ID} 
          className={styles.billItem}
        >
          <div className={styles.billHeader}>
            <a 
              href={bill.LINK_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.billTitle}
            >
              {bill.BILL_NM}
              <svg 
                className={styles.externalIcon}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24"
              >
                <path 
                  fill="currentColor" 
                  d="M14 5c-.6 0-1-.4-1-1s.4-1 1-1h6c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1s-1-.4-1-1V6.4l-9.3 9.3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4L17.6 5H14zm-5-1c.6 0 1 .4 1 1s-.4 1-1 1H5v12h12v-4c0-.6.4-1 1-1s1 .4 1 1v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h4z"
                />
              </svg>
            </a>
          </div>
          <dl className={styles.billInfo}>
            <dt>의안번호</dt>
            <dd>{bill.BILL_NO}</dd>
            
            <dt>의안종류</dt>
            <dd>{bill.BILL_KND}</dd>
            
            <dt>제안자</dt>
            <dd>{bill.PPSR_NM}</dd>
            
            <dt>제안일</dt>
            <dd>{formatDate(bill.PPSL_DT)}</dd>
            
            {bill.RGS_CONF_RSLT && (
              <>
                <dt>처리일자</dt>
                <dd>{formatDate(bill.RGS_RSLN_DT)}</dd>

                <dt>처리결과</dt>
                <dd>
                  <span className={`${styles.status} ${getStatusClass(bill.RGS_CONF_RSLT)}`}>
                    {bill.RGS_CONF_RSLT}
                  </span>
                </dd>
              </>
            )}
          </dl>
          {bill.hasVoteResult && (
            <Link 
              href={`/bills/${bill.BILL_ID}`} 
              className={styles.billLink}
            >
              표결 결과 보기
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}