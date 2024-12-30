import { BillsResponse, Bill, VoteResult } from '@/types/bill';
import { TRACKED_BILL_NUMBERS } from '@/constants/bills';

const API_BASE = 'https://open.assembly.go.kr/portal/openapi';
const BILL_LIST_API = `${API_BASE}/ALLBILL`;
const BILL_DETAIL_API = `${API_BASE}/BILLINFODETAIL`;
const VOTE_RESULT_API = `${API_BASE}/ncocpgfiaoituanbr`;

// 제네릭 타입 사용
class ServerMemoryCache {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

  set<T>(key: string, data: T) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // 캐시 만료 확인
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const serverCache = new ServerMemoryCache();

// 의안 번호로 조회
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
  // 캐시에서 먼저 확인
  const cachedBills = serverCache.get<{ bills: Bill[]; totalCount: number }>('tracked_bills');
  if (cachedBills) return cachedBills;

  try {
    // 모든 의안 번호에 대해 병렬로 요청
    const billPromises = TRACKED_BILL_NUMBERS.map(fetchBillByNo);
    const bills = await Promise.all(billPromises);
    
    // null 값 제거하고 유효한 데이터만 반환
    const validBills = bills.filter((bill): bill is Bill => bill !== null);

    const result = {
      bills: validBills,
      totalCount: validBills.length
    };

    // 서버 캐시에 저장
    serverCache.set('tracked_bills', result);

    return result;
  } catch (error) {
    console.error('Failed to fetch bills:', error);
    return { bills: [], totalCount: 0 };
  }
}

// 의안 상세 조회
export async function fetchBillDetail(billId: string) {
  // cacheKey 추가
  const cacheKey = `bill_detail_${billId}`;
  
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
    console.log('Full API Response:', JSON.stringify(data, null, 2));

    // 명시적으로 "INFO-200" 케이스 처리
    if (data?.BILLINFODETAIL?.[0]?.head?.[1]?.RESULT?.CODE === "INFO-200") {
      console.log('No data found for this bill');
      return null;
    }

    // 기존 유효성 검사 로직
    if (!data?.BILLINFODETAIL?.[0]?.head?.[1]?.RESULT) {
      console.error('Invalid API response structure:', data);
      return null;
    }

    // 결과 코드 확인
    const resultCode = data.BILLINFODETAIL[0].head[1].RESULT.CODE;
    if (resultCode !== 'INFO-000') {
      console.error('API returned error:', data.BILLINFODETAIL[0].head[1].RESULT.MESSAGE);
      return null;
    }

    // row 데이터는 BILLINFODETAIL의 두 번째 요소에 있음
    if (!data.BILLINFODETAIL[1]?.row?.[0]) {
      console.error('No bill data found');
      return null;
    }

    const billDetail = data.BILLINFODETAIL[1].row[0];

    // 캐시에 저장
    serverCache.set(cacheKey, billDetail);

    return billDetail;

  } catch (error) {
    console.error(`Failed to fetch detail for bill ${billId}:`, error);
    return null;
  }
}

// 표결 결과 조회
export async function fetchVoteResult(billId: string) {
  // cacheKey 추가
  const cacheKey = `vote_result_${billId}`;
  
  // 캐시에서 먼저 확인
  const cachedVoteResult = serverCache.get(cacheKey);
  if (cachedVoteResult) return cachedVoteResult;

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
    console.log('Vote Result API URL:', `${VOTE_RESULT_API}?${searchParams.toString()}`);
    
    if (!response.ok) {
      console.log(`No vote result available for bill ${billId}`);
      return null;
    }

    const data = await response.json();
    
    // API 응답 구조 체크
    if (!data?.ncocpgfiaoituanbr?.[0]?.head?.[1]?.RESULT) {
      console.log(`Invalid or no vote result structure for bill ${billId}`);
      return null;
    }

    // "INFO-200" 케이스 처리
    if (data.ncocpgfiaoituanbr[0].head[1].RESULT.CODE === "INFO-200") {
      console.log('No vote result found for this bill');
      return null;
    }

    const result = data.ncocpgfiaoituanbr[1]?.row?.[0];
    if (!result) {
      console.log('No vote result data for this bill');
      return null;
    }

    // 캐시에 저장
    serverCache.set(cacheKey, result);

    return result as VoteResult;

  } catch (error) {
    console.log(`No vote result available for bill ${billId}:`, error);
    return null;
  }
}
