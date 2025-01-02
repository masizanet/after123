require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { 
  API_BASE,
  BILL_LIST_API,
  BILL_DETAIL_API,
  VOTE_RESULT_API,
  VOTE_MEMBERS_API 
} = {
  API_BASE: 'https://open.assembly.go.kr/portal/openapi',
  BILL_LIST_API: 'https://open.assembly.go.kr/portal/openapi/ALLBILL',
  BILL_DETAIL_API: 'https://open.assembly.go.kr/portal/openapi/BILLINFODETAIL',
  VOTE_RESULT_API: 'https://open.assembly.go.kr/portal/openapi/ncocpgfiaoituanbr',
  VOTE_MEMBERS_API: 'https://open.assembly.go.kr/portal/openapi/nojepdqqaweusdfbi'
};

const TRACKED_BILL_NUMBERS = [
  '2206448',
  '2206312',
  '2206313',
  '2206314',
  '2206435',
  '2206961',
  '2206349',
  '2206348',
  '2206289',
  '2206269',
  '2206226',
  '2206206',
  '2206205',
  '2200819',
  '2206197',
  '2203837',
  '2207082',
  '2207147'
];

const fetch = require('node-fetch');

// 의안 상세 정보 조회
async function fetchBillDetail(billId) {
  const searchParams = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '300',
    BILL_ID: billId
  });

  const response = await fetch(`${BILL_DETAIL_API}?${searchParams.toString()}`);
  const data = await response.json();

  if (data?.BILLINFODETAIL?.[0]?.head?.[1]?.RESULT?.CODE !== 'INFO-000') {
    return null;
  }

  return data.BILLINFODETAIL[1]?.row?.[0] || null;
}

// 투표 결과 조회
async function fetchVoteResult(billId) {
  const searchParams = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '300',
    AGE: '22',
    BILL_ID: billId
  });

  const response = await fetch(`${VOTE_RESULT_API}?${searchParams.toString()}`);
  const data = await response.json();

  if (data?.ncocpgfiaoituanbr?.[0]?.head?.[1]?.RESULT?.CODE !== 'INFO-000') {
    return null;
  }

  return data.ncocpgfiaoituanbr[1]?.row?.[0] || null;
}

async function fetchVoteMembers(billId) {
  try {
    console.log(`Fetching vote members for bill ${billId}...`);
    
    // 전체 데이터를 한 번에 가져오기 위해 더 큰 페이지 크기 시도
    const params = new URLSearchParams({
      Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
      Type: 'json',
      pIndex: '1',
      pSize: '1000',  // 더 큰 값으로 시도
      AGE: '22',
      BILL_ID: billId,
      numOfRows: '1000'  // 일부 API에서 사용하는 파라미터
    });

    // API 요청 URL 로깅
    const url = `${VOTE_MEMBERS_API}?${params.toString()}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    // 응답 데이터 구조 로깅
    console.log('Response data structure:', JSON.stringify(data, null, 2));
    
    if (!data?.nojepdqqaweusdfbi?.[0]?.head?.[1]?.RESULT?.CODE ||
        data.nojepdqqaweusdfbi[0].head[1].RESULT.CODE !== 'INFO-000') {
      console.error(`Invalid response for bill ${billId}:`, data);
      return null;
    }

    const totalCount = data.nojepdqqaweusdfbi[0].head[0].list_total_count;
    const rows = data.nojepdqqaweusdfbi[1]?.row || [];
    
    console.log(`Received ${rows.length} rows out of ${totalCount} total`);
    
    return {
      nojepdqqaweusdfbi: [
        data.nojepdqqaweusdfbi[0],
        { row: rows }
      ]
    };
  } catch (error) {
    console.error(`Failed to fetch vote members for bill ${billId}:`, error);
    return null;
  }
}

async function fetchBillId(billNo) {
  const searchParams = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '300',
    AGE: '22',
    BILL_NO: billNo
  });

  const response = await fetch(`${BILL_LIST_API}?${searchParams.toString()}`);
  const data = await response.json();
  
  if (!data.ALLBILL?.[1]?.row?.[0]) return null;
  return data.ALLBILL[1].row[0].BILL_ID;
}

async function collectBillData() {
  try {
    // 기존 bills.json 읽기
    const billsJsonPath = path.join(__dirname, '../src/data/bills.json');
    const existingBillsData = JSON.parse(fs.readFileSync(billsJsonPath, 'utf8'));
    
    // 투표 결과가 있는 의안만 필터링
    const billsWithVotes = Object.entries(existingBillsData)
      .filter(([_, data]) => data.voteResult)
      .map(([billId, data]) => ({ billId, billNo: data.billNo }));

    console.log(`Found ${billsWithVotes.length} bills with vote results`);

    // 투표 멤버 데이터만 업데이트
    for (const { billId, billNo } of billsWithVotes) {
      console.log(`Fetching vote members for bill ${billNo}...`);
      
      const voteMembers = await fetchVoteMembers(billId);
      
      if (voteMembers) {
        // vote-members-*.json 파일 업데이트
        fs.writeFileSync(
          path.join(__dirname, `../src/data/vote-members-${billNo}.json`),
          JSON.stringify(voteMembers, null, 2),
          'utf8'
        );
        
        // bills.json의 voteMembers 필드 업데이트
        existingBillsData[billId].voteMembers = voteMembers.nojepdqqaweusdfbi[1].row;
      }
    }

    // 업데이트된 bills.json 저장
    fs.writeFileSync(billsJsonPath, JSON.stringify(existingBillsData, null, 2), 'utf8');
    console.log('Successfully updated vote members data');
  } catch (error) {
    console.error('Failed to collect vote members data:', error);
  }
}

collectBillData(); 