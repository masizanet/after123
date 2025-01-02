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

// member22.json 읽기
const memberPath = path.join(__dirname, '../src/data/member22.json');
const rawMemberData = JSON.parse(fs.readFileSync(memberPath, 'utf8'));
// 객체를 배열로 변환
const memberData = Object.values(rawMemberData);

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
    
    let allRows = [];
    let pageIndex = 1;
    let hasMoreData = true;
    const seenMembers = new Set();
    
    while (hasMoreData) {
      const params = new URLSearchParams({
        Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
        Type: 'json',
        pIndex: pageIndex.toString(),
        pSize: '300',  // 한 페이지당 300개씩
        AGE: '22',
        BILL_ID: billId
      });

      const url = `${VOTE_MEMBERS_API}?${params.toString()}`;
      console.log(`Fetching page ${pageIndex}...`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data?.nojepdqqaweusdfbi?.[0]?.head?.[1]?.RESULT?.CODE ||
          data.nojepdqqaweusdfbi[0].head[1].RESULT.CODE !== 'INFO-000') {
        console.error(`Invalid response for bill ${billId} page ${pageIndex}:`, data);
        break;
      }

      const totalCount = data.nojepdqqaweusdfbi[0].head[0].list_total_count;
      const currentRows = data.nojepdqqaweusdfbi[1]?.row || [];
      
      if (currentRows.length === 0) {
        console.log(`No more rows found at page ${pageIndex}`);
        break;
      }

      // 중복 제거하면서 데이터 추가
      for (const row of currentRows) {
        if (!row.HG_NM) {
          console.warn(`Missing HG_NM for a member in bill ${billId}`);
          continue;
        }

        // member22.json의 데이터와 매칭하여 고유 식별자 생성
        const member = memberData.find(m => m.HG_NM.replace(/\s+/g, '').toLowerCase() === row.HG_NM.replace(/\s+/g, '').toLowerCase());
        if (member) {
          const memberKey = `${member.MONA_CD}-${row.VOTE_DATE}`;
          if (!seenMembers.has(memberKey)) {
            seenMembers.add(memberKey);
            allRows.push({
              ...row,
              MONA_CD: member.MONA_CD,
              POLY_NM: member.POLY_NM,
              ORIG_NM: member.ORIG_NM
            });
          }
        } else {
          console.warn(`Member not found in member22.json: ${row.HG_NM}`);
          const memberKey = `${row.MEMBER_NO}-${row.VOTE_DATE}`;
          if (!seenMembers.has(memberKey)) {
            seenMembers.add(memberKey);
            allRows.push(row);
          }
        }
      }
      
      console.log(`Received ${currentRows.length} rows (unique: ${allRows.length}/${totalCount})`);
      
      // 실제 총 개수와 비교하여 페이징 처리
      const expectedPages = Math.ceil(totalCount / 300);
      if (pageIndex >= expectedPages || allRows.length >= totalCount) {
        console.log(`Completed fetching all ${allRows.length} members`);
        hasMoreData = false;
      } else {
        pageIndex++;
      }
    }

    return {
      nojepdqqaweusdfbi: [
        {
          head: [
            { list_total_count: allRows.length },
            { RESULT: { CODE: 'INFO-000', MESSAGE: 'SUCCESS' } }
          ]
        },
        { row: allRows }
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
    const dataDir = path.join(__dirname, '../src/data');

    // data 디렉토리가 없으면 생성
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

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
        const voteMembersPath = path.join(dataDir, `vote-members-${billNo}.json`);
        fs.writeFileSync(
          voteMembersPath,
          JSON.stringify(voteMembers, null, 2),
          'utf8'
        );
        console.log(`Saved vote members data to ${voteMembersPath}`);
      }
    }

    // bills.json 저장
    fs.writeFileSync(billsJsonPath, JSON.stringify(billsData, null, 2), 'utf8');
    console.log(`Saved bills data to ${billsJsonPath}`);
    
    console.log('Successfully collected bill data');
  } catch (error) {
    console.error('Failed to collect bill data:', error);
  }
}

collectBillData(); 