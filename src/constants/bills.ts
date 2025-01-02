// src/constants/bills.ts

import billsData from '@/data/bills.json';
import type { Bill, VoteResult } from '@/types/bill';

interface BillDetailRaw {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NM: string;
  PPSR_KIND: string;
  PPSR: string;
  PPSL_DT: string;
  PPSL_SESS: string;
  JRCMIT_NM: string;
  RGS_CONF_RSLT: string | null;
  RGS_RSLN_DT: string | null;
}

interface VoteMember {
  HG_NM: string;
  POLY_NM: string;
  ORIG_NM: string;
  RESULT_VOTE_MOD: string;
  MONA_CD: string;
}

interface BillDataRaw {
  detail: BillDetailRaw;
  voteResult?: VoteResult | null;
  voteMembers?: VoteMember[] | null;
  billNo: string;
}

// bills.json에서 billNo 목록 추출
export const TRACKED_BILL_NUMBERS = Object.values(billsData as unknown as Record<string, BillDataRaw>)
  .map(bill => bill.billNo)
  .filter((billNo): billNo is string => billNo !== undefined);

// bills 객체를 Bill 타입으로 변환
export const bills = Object.values(billsData as unknown as Record<string, BillDataRaw>)
  .map(billData => ({
    BILL_ID: billData.detail.BILL_ID,
    BILL_NO: billData.detail.BILL_NO,
    BILL_KND: '',  // 종류 필드 제거로 빈 문자열
    BILL_NM: billData.detail.BILL_NM,
    PPSR_KND: billData.detail.PPSR_KIND,
    PPSR_NM: '',
    PPSR: billData.detail.PPSR,
    PPSL_DT: billData.detail.PPSL_DT,
    JRCMIT_NM: billData.detail.JRCMIT_NM,
    RGS_CONF_RSLT: billData.detail.RGS_CONF_RSLT,
    LINK_URL: '',
    RGS_RSLN_DT: billData.detail.RGS_RSLN_DT,
    hasVoteResult: billData.voteResult !== null
  })) as Bill[];

// 필요한 경우 기존 메타데이터 유지
export const BILL_METADATA: Record<string, { 
  description?: string;
  emphasizeAbsent?: boolean;
}> = {
  '2206205': { 
    description: '대통령(윤석열) 탄핵소추안(1차)',
    emphasizeAbsent: true
  }
};