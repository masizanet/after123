'use client';

import { formatDate } from '@/lib/utils/date';
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './BillList.module.css';
import type { Bill } from '@/types/bill';
import { getPartyColor } from '@/constants/partyColors';

interface BillListProps {
  bills: Bill[];
}

function extractPartyFromPPSR(ppsr: string): string {
  const parties = [
    '더불어민주당', '국민의힘', '조국혁신당', 
    '개혁신당', '진보당', '기본소득당', '사회민주당'
  ];
  for (const party of parties) {
    if (ppsr.includes(party)) {
      return party;
    }
  }
  return '';
}

export function BillList({ bills }: BillListProps) {

  const [sortConfig, setSortConfig] = useState({
    key: 'BILL_NO',
    direction: 'desc'
  });

  const onSort = (key: string) => {
    setSortConfig((prevSort) => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortedBills = () => {
    const sortedBills = [...bills].sort((a, b) => {
      if (sortConfig.key === 'BILL_NO') {
        return sortConfig.direction === 'desc' 
          ? b.BILL_NO.localeCompare(a.BILL_NO)
          : a.BILL_NO.localeCompare(b.BILL_NO);
      }
      if (sortConfig.key === 'BILL_NM') {
        return sortConfig.direction === 'desc'
          ? b.BILL_NM.localeCompare(a.BILL_NM)
          : a.BILL_NM.localeCompare(b.BILL_NM);
      }
      if (sortConfig.key === 'PPSL_DT') {
        return sortConfig.direction === 'desc'
          ? new Date(b.PPSL_DT).getTime() - new Date(a.PPSL_DT).getTime()
          : new Date(a.PPSL_DT).getTime() - new Date(b.PPSL_DT).getTime();
      }
      if (sortConfig.key === 'RGS_RSLN_DT') {
        if (!a.RGS_RSLN_DT) return 1;
        if (!b.RGS_RSLN_DT) return -1;
        return sortConfig.direction === 'desc'
          ? new Date(b.RGS_RSLN_DT).getTime() - new Date(a.RGS_RSLN_DT).getTime()
          : new Date(a.RGS_RSLN_DT).getTime() - new Date(b.RGS_RSLN_DT).getTime();
      }
      return 0;
    });
    return sortedBills;
  };
  return (
    <div className={styles.scrollWrap}>
      <table className={styles.list}>
        <thead>
          <tr>
            <th 
              scope="col" 
              onClick={() => onSort('BILL_NO')}
              className={styles.sortable}
            >
              의안번호
              {sortConfig.key === 'BILL_NO' && (
                <span className={styles.sortIcon}>
                  {sortConfig.direction === 'desc' ? '▼' : '▲'}
                </span>
              )}
            </th>
            <th 
              scope="col"
              onClick={() => onSort('BILL_NM')}
              className={styles.sortable}
            >
              의안명 - 제안자
              {sortConfig.key === 'BILL_NM' && (
                <span className={styles.sortIcon}>
                  {sortConfig.direction === 'desc' ? '▼' : '▲'}
                </span>
              )}
            </th>
            <th 
              scope="col"
              onClick={() => onSort('PPSL_DT')}
              className={styles.sortable}
            >
              제안일
              {sortConfig.key === 'PPSL_DT' && (
                <span className={styles.sortIcon}>
                  {sortConfig.direction === 'desc' ? '▼' : '▲'}
                </span>
              )}
            </th>
            <th 
              scope="col"
              onClick={() => onSort('RGS_RSLN_DT')}
              className={styles.sortable}
            >
              처리일
              {sortConfig.key === 'RGS_RSLN_DT' && (
                <span className={styles.sortIcon}>
                  {sortConfig.direction === 'desc' ? '▼' : '▲'}
                </span>
              )}
            </th>
            <th scope="col">처리결과</th>
            <th scope="col">원문</th>
          </tr>
        </thead>
        <tbody>
          {getSortedBills().map((bill) => {
            const hasVoteResult = bill.hasVoteResult;
            const party = extractPartyFromPPSR(bill.PPSR);

            if (bill.RGS_RSLN_DT) {
              return (
                <tr key={bill.BILL_ID} className={styles.item}>
                  <td className={styles.number}>{bill.BILL_NO}</td>
                  <td className={styles.info}>
                    {bill.BILL_NM}
                    <span className={styles.knds}>
                      {bill.PPSR_KND === '의원' && bill.PPSR.includes('의원') && (
                        <span className={styles.partyName}>
                          {'('}
                          <span 
                            className={styles.partyColor} 
                            style={{ 
                              backgroundColor: getPartyColor(party).main 
                            }} 
                          />
                          {bill.PPSR}
                        </span>
                      )}
                      {'- '}{bill.PPSR_KND !== '의원' && bill.PPSR}
                    </span>
                  </td>
                  <td className={styles.date}>{formatDate(bill.PPSL_DT)}</td>
                  <td className={styles.date}>{bill.RGS_RSLN_DT ? formatDate(bill.RGS_RSLN_DT) : '-'}</td>
                  <td className={styles.result}>
                    <span>{bill.RGS_CONF_RSLT || '-'}</span>
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
                  </td>
                  <td className={styles.outlink}>
                    <a href={`http://likms.assembly.go.kr/bill/billDetail.do?billId=${bill.BILL_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.button}
                      title="새창" 
                      aria-label={`${bill.BILL_NM}(의안정보시스템 원문)`}
                    >
                      링크
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
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
}
