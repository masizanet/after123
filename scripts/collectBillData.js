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

const fetch = require('node-fetch');

// constants/bills.json에서 TRACKED_BILL_NUMBERS 읽기
const constantsPath = path.join(__dirname, '../src/constants/bills.json');
const { TRACKED_BILL_NUMBERS } = JSON.parse(fs.readFileSync(constantsPath, 'utf8'));

// data/bills.json 경로 설정
const billsJsonPath = path.join(__dirname, '../src/data/bills.json');

// 의안 상세 정보 조회
async function fetchBillDetail(billNo) {
  try {
    // 먼저 BILL_ID 조회
    const billId = await fetchBillId(billNo);
    if (!billId) {
      console.error(`Failed to get BILL_ID for bill ${billNo}`);
      return null;
    }

    console.log(`Fetching details for bill ${billNo} (ID: ${billId})`);

    const params = new URLSearchParams({
      Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
      Type: 'json',
      pIndex: '1',
      pSize: '1',
      AGE: '22',
      BILL_ID: billId
    });

    const response = await fetch(`${BILL_DETAIL_API}?${params.toString()}`);
    const data = await response.json();

    // 응답 데이터 구조 로깅
    console.log(`Response for bill ${billNo}:`, JSON.stringify(data, null, 2));

    if (!data?.BILLINFODETAIL?.[0]?.head?.[1]?.RESULT?.CODE ||
        data.BILLINFODETAIL[0].head[1].RESULT.CODE !== 'INFO-000') {
      console.error(`Invalid response for bill detail ${billNo}:`, data);
      return null;
    }

    const detail = data.BILLINFODETAIL[1].row[0];
    
    // 처리일과 결과가 있는지 확인하고 로깅
    if (!detail.RGS_RSLN_DT || !detail.RGS_CONF_RSLT) {
      console.warn(`Missing processing date or result for bill ${billNo}:`, {
        RGS_RSLN_DT: detail.RGS_RSLN_DT,
        RGS_CONF_RSLT: detail.RGS_CONF_RSLT
      });
    }

    return detail;
  } catch (error) {
    console.error(`Failed to fetch bill detail for ${billNo}:`, error);
    return null;
  }
}

// 투표 결과 조회
async function fetchVoteResult(billId) {
  try {
    const params = new URLSearchParams({
      Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
      Type: 'json',
      pIndex: '1',
      pSize: '1',
      AGE: '22',
      BILL_ID: billId
    });

    const response = await fetch(`${VOTE_RESULT_API}?${params.toString()}`);
    const data = await response.json();

    if (!data?.ncocpgfiaoituanbr?.[0]?.head?.[1]?.RESULT?.CODE ||
        data.ncocpgfiaoituanbr[0].head[1].RESULT.CODE !== 'INFO-000') {
      console.error(`Invalid response for vote result ${billId}:`, data);
      return null;
    }

    return data.ncocpgfiaoituanbr[1].row[0];
  } catch (error) {
    console.error(`Failed to fetch vote result for ${billId}:`, error);
    return null;
  }
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
    const billsData = {};

    // 각 의안에 대해 데이터 수집
    for (const billNo of TRACKED_BILL_NUMBERS) {
      console.log(`Fetching data for bill ${billNo}...`);
      
      // 의안 상세 정보 조회
      const detail = await fetchBillDetail(billNo);
      if (!detail) {
        console.error(`Failed to fetch detail for bill ${billNo}`);
        continue;
      }

      const billId = detail.BILL_ID;
      
      // 투표 결과 조회
      const voteResult = await fetchVoteResult(billId);
      if (voteResult) {
        console.log(`Vote result found for bill ${billNo}`);
      }
      
      // 투표 멤버 조회
      const voteMembers = voteResult ? await fetchVoteMembers(billId) : null;
      if (voteMembers) {
        console.log(`Vote members found for bill ${billNo}`);
      }

      // bills.json에 저장할 데이터 구조
      billsData[billId] = {
        detail,
        voteResult,
        voteMembers: voteMembers?.nojepdqqaweusdfbi?.[1]?.row || null,
        billNo
      };

      // vote-members 파일 별도 저장
      if (voteMembers) {
        fs.writeFileSync(
          path.join(__dirname, `../src/data/vote-members-${billNo}.json`),
          JSON.stringify(voteMembers, null, 2),
          'utf8'
        );
      }
    }

    // bills.json 저장
    fs.writeFileSync(billsJsonPath, JSON.stringify(billsData, null, 2), 'utf8');
    
    console.log('Successfully collected bill data');
  } catch (error) {
    console.error('Failed to collect bill data:', error);
  }
}

collectBillData(); 