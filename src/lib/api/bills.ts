// src/lib/api/bills.ts

import { BillsResponse, Bill, VoteResult, VoteMember } from '@/types/bill';
import { TRACKED_BILL_NUMBERS } from '@/constants/bills';
import { BILL_2206205_ABSENTEES } from '@/constants/absentMembers';

const API_BASE = 'https://open.assembly.go.kr/portal/openapi';
const BILL_LIST_API = `${API_BASE}/ALLBILL`;
const BILL_DETAIL_API = `${API_BASE}/BILLINFODETAIL`;
const VOTE_RESULT_API = `${API_BASE}/ncocpgfiaoituanbr`;
const VOTE_MEMBERS_API = `${API_BASE}/nojepdqqaweusdfbi`;

const BILL_2206205_ID = 'PRC_F2Y4Z1N2G0Y5Q1A4M1O0P4N2I4P3N1';
const BILL_2206205_NAME = '대통령(윤석열) 탄핵소추안(1차)';
const BILL_2206205_VOTE_RESULT: VoteResult = {
  BILL_ID: "2206205",
  PROC_DT: "20241210",
  BILL_NO: "2206205",
  BILL_NAME: BILL_2206205_NAME,
  CURR_COMMITTEE: "",
  PROC_RESULT_CD: "",
  MEMBER_TCNT: "300",     // 전체 의원수
  VOTE_TCNT: "195",      // 참석 의원수 (300 - 105)
  YES_TCNT: "0",         // 찬성
  NO_TCNT: "0",          // 반대
  BLANK_TCNT: "195",     // 기권/무효
  LINK_URL: ""
};

const isDevelopment = process.env.NODE_ENV === 'development';

function logDebug(...args: unknown[]) {
  if (isDevelopment) {
    console.log(...args);
  }
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
  const searchParams = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '1',
    BILL_ID: billId
  });

  try {
    const response = await fetch(`${BILL_DETAIL_API}?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data?.BILLINFODETAIL?.[0]?.head?.[1]?.RESULT?.CODE === "INFO-200") {
      return null;
    }

    if (!data?.BILLINFODETAIL?.[0]?.head?.[1]?.RESULT) {
      logDebug('Invalid API response structure:', data);
      return null;
    }

    const resultCode = data.BILLINFODETAIL[0].head[1].RESULT.CODE;
    if (resultCode !== 'INFO-000') {
      logDebug('API returned error:', data.BILLINFODETAIL[0].head[1].RESULT.MESSAGE);
      return null;
    }

    if (!data.BILLINFODETAIL[1]?.row?.[0]) {
      logDebug('No bill data found');
      return null;
    }

    const billDetail = data.BILLINFODETAIL[1].row[0];
    return billDetail;

  } catch (error) {
    logDebug(`Failed to fetch detail for bill ${billId}:`, error);
    return null;
  }
}

export async function fetchVoteResult(billId: string): Promise<VoteResult | null> {
  // 2206205 법안의 경우 고정된 결과 반환
  if (billId === BILL_2206205_ID || billId.includes('2206205')) {
    return {
      ...BILL_2206205_VOTE_RESULT,
      BILL_ID: billId
    };
  }

  const searchParams = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '1',
    AGE: '22',
    BILL_ID: billId
  });

  try {
    const response = await fetch(`${VOTE_RESULT_API}?${searchParams.toString()}`);
    
    if (!response.ok) {
      return createEmptyVoteResult(billId);
    }

    const data = await response.json();
    
    if (data?.ncocpgfiaoituanbr?.[0]?.head?.[1]?.RESULT?.CODE === "INFO-200") {
      return createEmptyVoteResult(billId);
    }

    if (data?.ncocpgfiaoituanbr?.[0]?.head?.[1]?.RESULT?.CODE !== "INFO-000") {
      return createEmptyVoteResult(billId);
    }

    const result = data.ncocpgfiaoituanbr[1]?.row?.[0];
    if (!result) {
      return createEmptyVoteResult(billId);
    }

    return result as VoteResult;

  } catch (error) {
    console.error(`Error fetching vote result for bill ${billId}:`, error);
    return createEmptyVoteResult(billId);
  }
}

export async function fetchVoteMembers(billId: string): Promise<VoteMember[]> {
  // 2206205 법안의 경우 하드코딩된 불참자 명단 반환
  if (billId === BILL_2206205_ID || billId.includes('2206205')) {
    return BILL_2206205_ABSENTEES.map(member => ({
      POLY_NM: member.party,
      HG_NM: member.name,
      ORIG_NM: member.region,
      VOTE_DT: '20241210',
      BILL_NO: '2206205',
      BILL_NM: BILL_2206205_NAME,
      PROC_RESULT: '불참'
    }));
  }

  const searchParams = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '300',
    AGE: '22',
    BILL_ID: billId
  });

  try {
    const response = await fetch(`${VOTE_MEMBERS_API}?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vote members');
    }

    const data = await response.json();

    if (data?.nojepdqqaweusdfbi?.[0]?.head?.[1]?.RESULT?.CODE !== "INFO-000") {
      return [];
    }

    return data.nojepdqqaweusdfbi[1].row || [];
  } catch (error) {
    console.error('Error fetching vote members:', error);
    return [];
  }
}

function createEmptyVoteResult(billId: string): VoteResult {
  return {
    BILL_ID: billId,
    PROC_DT: "",
    BILL_NO: "",
    BILL_NAME: "",
    CURR_COMMITTEE: "",
    PROC_RESULT_CD: "",
    MEMBER_TCNT: "300",
    VOTE_TCNT: "0",
    YES_TCNT: "0",
    NO_TCNT: "0",
    BLANK_TCNT: "0",
    LINK_URL: ""
  };
}