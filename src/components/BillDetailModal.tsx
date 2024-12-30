'use client';

import { useEffect, useState } from 'react';
import { BillDetail } from '@/types/bill';
import { fetchBillDetail, fetchVoteResult } from '@/lib/api/bills';
import styles from './BillDetailModal.module.css';

export function clearBillDetailCache(billId?: string) {
  if (billId) {
    serverCache.delete(`bill_detail_${billId}`);
    serverCache.delete(`vote_result_${billId}`);
  } else {
    // 모든 법안 관련 캐시 초기화
    serverCache.clear();
  }
}

interface BillDetailModalProps {
  billId: string;
  onClose: () => void;
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

export function BillDetailModal({ billId, onClose }: BillDetailModalProps) {
  const [billDetail, setBillDetail] = useState<BillDetail | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [detail, vote] = await Promise.all([
          fetchBillDetail(billId),
          fetchVoteResult(billId)
        ]);
  
        if (!detail) {
          setError('해당 법안에 대한 상세 정보를 찾을 수 없습니다.');
        } else {
          setBillDetail(detail);
        }
  
        // vote 결과가 null이어도 괜찮음
        setVoteResult(vote);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  
    loadData();
  }, [billId]);  

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.loading}>로딩중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  if (!billDetail) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.error}>상세 정보를 불러올 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{billDetail.BILL_NM}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <dl className={styles.detailList}>
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
          <div className={styles.voteResult}>
            <h3>표결 결과</h3>
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
          </div>
        )}
      </div>
    </div>
  );
}
