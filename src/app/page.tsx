'use client';

import { useState, useEffect } from 'react';
import { fetchTrackedBills } from '@/lib/api/bills';
import styles from './page.module.css';
import { BillDetailModal } from '@/components/BillDetailModal';

function formatDate(dateString: string | null) {
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

export default function Home() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillId, setSelectedBillId] = useState(null);

  useEffect(() => {
    document.title = '12.3 내란 관련 주요 법안';
  }, []);

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    async function loadBills() {
      try {
        const { bills } = await fetchTrackedBills();
        // 처리일자 기준 내림차순 정렬
        const sortedBills = [...bills].sort((a, b) => {
          const dateA = a.RGS_RSLN_DT ? new Date(a.RGS_RSLN_DT) : new Date(0);
          const dateB = b.RGS_RSLN_DT ? new Date(b.RGS_RSLN_DT) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        setBills(sortedBills);
      } catch (error) {
        console.error('Failed to load bills:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBills();
  }, []);

  if (loading) {
    return <div className={styles.loading}>로딩중...</div>;
  }

  // 의안 클릭 핸들러
  const handleBillClick = (billId) => {
    setSelectedBillId(billId);
  };

  return (
    <main className={styles.main}>
      <h1>12.3 내란 관련 주요 법안</h1>
      <div className={styles.billList}>
        {bills.map((bill) => (
          <article 
            key={bill.BILL_ID} 
            className={styles.billItem}
            onClick={() => handleBillClick(bill.BILL_ID)}
          >
            <h2>{bill.BILL_NM}</h2>
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
            <a 
              href={bill.LINK_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.billLink}
              onClick={(e) => e.stopPropagation()} // 상위 클릭 이벤트 방지
            >
              상세정보 보기
            </a>
          </article>
        ))}
      </div>

      {selectedBillId && (
        <BillDetailModal 
          billId={selectedBillId}
          onClose={() => setSelectedBillId(null)}
        />
      )}
    </main>
  );
}