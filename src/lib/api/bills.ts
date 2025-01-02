// src/lib/api/bills.ts

import type { 
  Bill,
  BillsResponse,
  VoteResult,
  APIVoteMember 
} from '@/types/bill';

import { logDebug } from '@/lib/utils/debug';
import { TRACKED_BILL_NUMBERS } from '@/constants/bills';
import { BILL_2206205_ABSENTEES } from '@/constants/absentMembers';
import { 
  BILL_LIST_API,
  BILL_DETAIL_API,
  VOTE_RESULT_API,
  VOTE_MEMBERS_API 
} from '@/constants/apis';
import billsData from '@/data/bills.json';
import member22Data from '@/data/member22.json';
import type { BillDetail } from '@/types/bill';
import type { Member22 } from '@/types/member';
import fs from 'fs';
import path from 'path';

export type {
  Bill,
  BillDetail,
};

export interface BillData {
  detail: BillDetail;
  voteResult: import('@/types/bill').VoteResult | null;
  members: Member22[];
}

export async function getBillData(billId: string): Promise<BillData | null> {
  const billData = billsData[billId];
  
  if (!billData?.detail) {
    return null;
  }

  // 2206205 의안은 voteResult가 없어도 표시
  if (!billData.voteResult && billData.detail.BILL_NO !== '2206205') {
    return null;
  }

  return {
    detail: billData.detail,
    voteResult: billData.voteResult || {
      BILL_ID: billId,
      PROC_DT: "20241210",
      BILL_NO: "2206205",
      BILL_NAME: billData.detail.BILL_NM,
      CURR_COMMITTEE: "",
      PROC_RESULT_CD: "",
      MEMBER_TCNT: "300",
      VOTE_TCNT: "195",
      YES_TCNT: "0",
      NO_TCNT: "0",
      BLANK_TCNT: "195",
      LINK_URL: ""
    },
    members: member22Data.members
  };
}

export const BILL_2206205_ID = 'PRC_P2U4C1T2Q0J4E1F7B5G6W3L7D1W6P4';
export const BILL_2206205_NAME = '대통령(윤석열) 탄핵소추안(1차)';

const BILL_2206205_VOTE_RESULT: VoteResult = {
  BILL_ID: BILL_2206205_ID,
  PROC_DT: "20241210",
  BILL_NO: "2206205",
  BILL_NAME: BILL_2206205_NAME,
  CURR_COMMITTEE: "",
  PROC_RESULT_CD: "",
  MEMBER_TCNT: "300",            // 전체 의원수
  VOTE_TCNT: "195",             // 참석한 의원수 (300 - 105)
  YES_TCNT: "0",                // 찬성
  NO_TCNT: "0",                 // 반대
  BLANK_TCNT: "195",            // 무효/기권 (참석은 했으나 투표 불성립)
  LINK_URL: ""
};

async function fetchBillByNo(billNo: string) {
  const searchParams = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '100',
    AGE: '22',
    BILL_NO: billNo
  });

  const response = await fetch(`${BILL_LIST_API}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`API request failed for bill ${billNo}: ${response.status}`);
  }

  const data: BillsResponse = await response.json();
  
  if (!data.ALLBILL || data.ALLBILL.length < 2) {
    return null;
  }

  const [headData, rowData] = data.ALLBILL;
  
  if (headData.head[1].RESULT.CODE !== 'INFO-000' || !rowData.row?.length) {
    return null;
  }

  return rowData.row[0];
}

export async function fetchTrackedBills() {
  try {
    const billPromises = TRACKED_BILL_NUMBERS.map(fetchBillByNo);
    const bills = await Promise.all(billPromises);
    const validBills = bills.filter((bill): bill is Bill => bill !== null);

    return {
      bills: validBills,
      totalCount: validBills.length
    };
  } catch (error) {
    logDebug('Failed to fetch bills:', error);
    return { bills: [], totalCount: 0 };
  }
}

export async function fetchBillDetail(billId: string) {
  return billsData[billId]?.detail || null;
}

export async function fetchVoteResult(billId: string) {
  return billsData[billId]?.voteResult || null;
}

export async function fetchVoteMembers(billId: string, billNo: string) {
  try {
    const response = await fetch(`/api/vote-members/${billNo}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vote members');
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch vote members for bill ${billId}:`, error);
    return null;
  }
}
