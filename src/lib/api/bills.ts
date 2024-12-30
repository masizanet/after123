import { BillsResponse, Bill, VoteResult } from '@/types/bill';
import { TRACKED_BILL_NUMBERS } from '@/constants/bills';

const API_BASE = 'https://open.assembly.go.kr/portal/openapi';
const BILL_LIST_API = `${API_BASE}/ALLBILL`;
const BILL_DETAIL_API = `${API_BASE}/BILLINFODETAIL`;
const VOTE_RESULT_API = `${API_BASE}/ncocpgfiaoituanbr`;

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

export async function fetchVoteResult(billId: string) {
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
    
    if (!data?.ncocpgfiaoituanbr?.[0]?.head?.[1]?.RESULT) {
      return null;
    }

    if (data.ncocpgfiaoituanbr[0].head[1].RESULT.CODE === "INFO-200") {
      return null;
    }

    const result = data.ncocpgfiaoituanbr[1]?.row?.[0];
    if (!result) {
      return null;
    }

    return result as VoteResult;

  } catch (error) {
    logDebug(`No vote result available for bill ${billId}:`, error);
    return null;
  }
}