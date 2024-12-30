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

// export async function fetchVoteResult(billId: string) {
//   const searchParams = new URLSearchParams({
//     Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
//     Type: 'json',
//     pIndex: '1',
//     pSize: '1',
//     AGE: '22',
//     BILL_ID: billId
//   });

//   try {
//     const response = await fetch(`${VOTE_RESULT_API}?${searchParams.toString()}`);
    
//     if (!response.ok) {
//       return null;
//     }

//     const data = await response.json();
    
//     if (!data?.ncocpgfiaoituanbr?.[0]?.head?.[1]?.RESULT) {
//       return null;
//     }

//     if (data.ncocpgfiaoituanbr[0].head[1].RESULT.CODE === "INFO-200") {
//       return null;
//     }

//     const result = data.ncocpgfiaoituanbr[1]?.row?.[0];
//     if (!result) {
//       return null;
//     }

//     return result as VoteResult;

//   } catch (error) {
//     logDebug(`No vote result available for bill ${billId}:`, error);
//     return null;
//   }
// }

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

    const resultCode = data.ncocpgfiaoituanbr[0].head[1].RESULT.CODE;

    // INFO-200도 유효한 결과로 처리 (표결 시도는 있었으나 불성립)
    if (resultCode === "INFO-200") {
      return {
        BILL_ID: billId,
        PROC_DT: "",
        BILL_NO: "",
        BILL_NAME: "",
        CURR_COMMITTEE: "",
        PROC_RESULT_CD: "",
        MEMBER_TCNT: "300",  // 총 의원수
        VOTE_TCNT: "0",      // 투표 참여수
        YES_TCNT: "0",       // 찬성
        NO_TCNT: "0",        // 반대
        BLANK_TCNT: "0",     // 기권
        LINK_URL: ""
      };
    }

    // INFO-000이 아닌 경우는 null 반환
    if (resultCode !== "INFO-000") {
      return null;
    }

    const result = data.ncocpgfiaoituanbr[1]?.row?.[0];
    if (!result) {
      return null;
    }

    return result as VoteResult;
  } catch (error) {
    console.error(`No vote result available for bill ${billId}:`, error);
    return null;
  }
}


export async function fetchVoteMembers(billId: string): Promise<VoteMember[]> {
  // 먼저 표결 정보를 가져와서 표결일자를 확인
  const voteResult = await fetchVoteResult(billId);
  if (!voteResult) return [];

  const searchParams = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '300',
    AGE: '22',
    BILL_ID: billId,
    PROC_DT: voteResult.PROC_DT // 표결 일자 추가
  });

  try {
    const response = await fetch(`${API_BASE}/nojepdqqaweusdfbi?${searchParams.toString()}`);
    if (!response.ok) {
      console.error('Failed to fetch vote members');
      return [];
    }

    const data = await response.json();
    console.log('Vote members API response:', data); // 디버깅용

    // API 응답 구조 체크
    if (data?.nojepdqqaweusdfbi?.[0]?.head?.[1]?.RESULT?.CODE !== "INFO-000") {
      return [];
    }

    return data.nojepdqqaweusdfbi[1].row || [];
  } catch (error) {
    console.error('Error fetching vote members:', error);
    return [];
  }
}