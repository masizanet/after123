import { fetchTrackedBills, fetchVoteResult } from '@/lib/api/bills';
import Link from 'next/link';
import styles from './page.module.css';
import { formatDate } from '@/lib/utils/date';
import { getStatusClass } from '@/lib/utils/status';

export default async function Home() {
  // 빌드 시점에 데이터 가져오기
  const { bills: fetchedBills } = await fetchTrackedBills();
  
  // 각 법안의 표결 정보 확인
  const bills = await Promise.all(
    fetchedBills.map(async (bill) => {
      const voteResult = await fetchVoteResult(bill.BILL_ID);
      return {
        ...bill,
        hasVoteResult: voteResult !== null
      };
    })
  );

  // 처리일자 기준 내림차순 정렬
  const sortedBills = bills.sort((a, b) => {
    const dateA = new Date(a.PPSL_DT);
    const dateB = new Date(b.PPSL_DT);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <main className={styles.main}>
      <h1>12.3 내란 관련 주요 법안</h1>
      <div className={styles.billList}>
        {sortedBills.map((bill) => (
          <article 
            key={bill.BILL_ID} 
            className={styles.billItem}
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
                  <dt>처리결과</dt>
                  <dd>
                    <span className={`${styles.status} ${getStatusClass(bill.RGS_CONF_RSLT)}`}>
                      {bill.RGS_CONF_RSLT}
                    </span>
                  </dd>
                </>
              )}
            </dl>
            
            {bill.hasVoteResult ? (
              <Link 
                href={`/bills/${bill.BILL_ID}`}
                className={styles.billLink}
              >
                표결 결과 보기
              </Link>
            ) : (
              <a 
                href={bill.LINK_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.externalLink}
              >
                국회 의안정보시스템 바로가기
                <span className="sr-only">(새 창에서 열기)</span>
              </a>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

// 페이지를 static하게 생성
export const dynamic = 'force-static';
export const revalidate = false;