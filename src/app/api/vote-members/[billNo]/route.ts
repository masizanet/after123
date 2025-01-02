import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import billsData from '@/data/bills.json';
import { BILL_2206205_ABSENTEES } from '@/constants/absentMembers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ billNo: string }> }
) {
  const { billNo } = await params;
  
  try {
    // 2206205 의안의 경우 특별 처리
    if (billNo === '2206205') {
      const absentMembers = BILL_2206205_ABSENTEES.map(member => ({
        POLY_NM: member.party,
        HG_NM: member.name,
        ORIG_NM: member.region,
        VOTE_DT: '20241210',
        BILL_NO: '2206205',
        BILL_NAME: '대통령(윤석열) 탄핵소추안(1차)',
        RESULT_VOTE_MOD: '불참',
        MONA_CD: member.name,  // 임시 ID로 이름 사용
        PROC_RESULT: '불참'
      }));

      // 파일로 저장
      const filePath = path.join(process.cwd(), 'src/data', `vote-members-${billNo}.json`);
      if (!fs.existsSync(filePath)) {
        const data = {
          nojepdqqaweusdfbi: [
            {
              head: [
                { list_total_count: absentMembers.length },
                { RESULT: { CODE: 'INFO-000', MESSAGE: 'SUCCESS' } }
              ]
            },
            { row: absentMembers }
          ]
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      }

      return NextResponse.json(absentMembers);
    }

    // 1. 파일이 있는지 확인
    const filePath = path.join(process.cwd(), 'src/data', `vote-members-${billNo}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const rows = data.nojepdqqaweusdfbi[1].row;
      
      // 5개 이상의 데이터가 있으면 바로 반환
      if (rows.length > 5) {
        return NextResponse.json(rows);
      }
    }

    // 2. bills.json에서 의안ID 찾기
    const billEntry = Object.entries(billsData).find(([_, data]) => data.billNo === billNo);
    if (!billEntry) {
      console.error(`Bill not found: ${billNo}`);
      return NextResponse.json(null);
    }
    const [billId] = billEntry;

    // 3. API 호출
    const params = new URLSearchParams({
      Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
      Type: 'json',
      pIndex: '1',
      pSize: '1000',
      AGE: '22',
      BILL_ID: billId
    });

    const response = await fetch(
      `https://open.assembly.go.kr/portal/openapi/nojepdqqaweusdfbi?${params.toString()}`
    );
    const data = await response.json();

    if (!data?.nojepdqqaweusdfbi?.[0]?.head?.[1]?.RESULT?.CODE ||
        data.nojepdqqaweusdfbi[0].head[1].RESULT.CODE !== 'INFO-000') {
      return NextResponse.json(null);
    }

    const rows = data.nojepdqqaweusdfbi[1]?.row || [];
    
    // 4. 데이터가 5개 이상이면 파일로 저장
    if (rows.length > 5) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Saved vote members data for bill ${billNo}`);
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error(`Failed to fetch vote members for bill ${billNo}:`, error);
    return NextResponse.json(null);
  }
} 