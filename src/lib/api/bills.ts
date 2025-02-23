// src/lib/api/bills.ts

import type { 
  Bill,
  BillsResponse,
} from '@/types/bill';

import { logDebug } from '@/lib/utils/debug';
import { TRACKED_BILL_NUMBERS } from '@/constants/bills';
import { BILL_LIST_API } from '@/constants/apis';
import billsData from '@/data/bills.json';
import member22Data from '@/data/member22.json';
import type { BillDetail } from '@/types/bill';
import type { Member22 } from '@/types/member';

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

  if (!billData.voteResult) {
    return null;
  }

  return {
    detail: billData.detail,
    voteResult: billData.voteResult,
    members: member22Data.members
  };
}

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
