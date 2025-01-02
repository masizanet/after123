'use client';

import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import styles from './BillList.module.css';
import type { Bill } from '@/types/bill';

interface BillListProps {
  bills: Bill[];
}

export function BillList({ bills }: BillListProps) {
  return (
    <ul className={styles.list}>
      {bills.map((bill) => {
        const hasVoteResult = bill.hasVoteResult && bill.BILL_NO !== '2206205';

        return (
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
                    {hasVoteResult && (
                      <Link
                        href={`/bills/${bill.BILL_ID}`}
                        className={styles.button}
                      >
                        표결 정보
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
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                      </Link>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </li>
        );
      })}
    </ul>
  );
}