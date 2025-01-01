// src/lib/api/bills.ts

import { logDebug } from '@/lib/utils/debug';
import { BillsResponse, Bill, VoteResult, APIVoteMember } from '@/types/bill';
import { TRACKED_BILL_NUMBERS } from '@/constants/bills';
import { BILL_LIST_API,BILL_DETAIL_API,VOTE_RESULT_API,VOTE_MEMBERS_API } from '@/constants/apis';
import { BILL_2206205_ABSENTEES } from '@/constants/absentMembers';


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
  // 2206205 법안인지 확인하는 함수
  const is2206205Bill = (id: string) => 
    id === BILL_2206205_ID || 
    id.includes('2206205') || 
    id === 'PRC_V2Y4M1J2X0P9Y1S8X3P8L2H5K0C5R1';

  // 2206205 법안인 경우 하드코딩된 결과 반환
  if (is2206205Bill(billId)) {
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
      return null;
    }

    const data = await response.json();
    
    // INFO-200이나 다른 에러코드의 경우 null 반환
    if (data?.ncocpgfiaoituanbr?.[0]?.head?.[1]?.RESULT?.CODE !== "INFO-000") {
      return null;
    }

    const result = data.ncocpgfiaoituanbr[1]?.row?.[0];
    if (!result) {
      return null;
    }

    return result as VoteResult;

  } catch (error) {
    console.error(`Error fetching vote result for bill ${billId}:`, error);
    return null;
  }
}

export async function fetchVoteMembers(billId: string): Promise<APIVoteMember[]> {
  // 2206205 법안의 경우 하드코딩된 불참자 명단 반환
  if (billId === BILL_2206205_ID) {
    return BILL_2206205_ABSENTEES.map(member => ({
      POLY_NM: member.party,
      HG_NM: member.name,
      ORIG_NM: member.region,
      VOTE_DT: '20241210',
      BILL_NO: '2206205',
      BILL_NM: BILL_2206205_NAME,
      RESULT_VOTE_MOD: "불참",  
      MONA_CD: member.name,     // 임시 ID로 이름 사용
      PROC_RESULT: '불참'
    } as APIVoteMember));
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
