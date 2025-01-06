require('dotenv').config();
const fs = require('fs');
const path = require('path');

// bills.json과 vote-members 파일들 읽기
const billsPath = path.join(__dirname, '../src/data/bills.json');
const dataDir = path.join(__dirname, '../src/data');
const bills = JSON.parse(fs.readFileSync(billsPath, 'utf8'));

// 분석할 법안 목록
const TARGET_BILLS = [
  {
    billNo: '2207147',
    name: '윤석열 정부의 비상계엄 선포를 통한 내란 혐의 진상규명 국정조사계획서 승인의 건'
  },
  // 다른 법안들 추가...
];

function analyzeVotes() {
  const results = [];

  TARGET_BILLS.forEach(targetBill => {
    const voteMembersPath = path.join(dataDir, `vote-members-${targetBill.billNo}.json`);
    if (!fs.existsSync(voteMembersPath)) {
      console.warn(`No vote data for bill ${targetBill.billNo}`);
      return;
    }

    const voteData = JSON.parse(fs.readFileSync(voteMembersPath, 'utf8'));
    const pplMembers = voteData.nojepdqqaweusdfbi[1].row
      .filter(member => member.POLY_NM === '국민의힘')
      .map(member => ({
        name: member.HG_NM,
        region: member.ORIG_NM,
        vote: member.RESULT_VOTE_MOD,
        date: member.VOTE_DATE,
        billNo: targetBill.billNo,
        billName: targetBill.name
      }));

    results.push(...pplMembers);
  });

  // 날짜순으로 정렬
  results.sort((a, b) => a.date.localeCompare(b.date));

  // 결과 저장
  const outputPath = path.join(dataDir, 'ppl-votes.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Saved analysis to ${outputPath}`);
}

analyzeVotes(); 