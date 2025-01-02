require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function fetchMemberMonaCodes() {
  try {
    // vote-members-*.json 파일들 읽기
    const dataDir = path.join(__dirname, '../src/data');
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('vote-members-') && file.endsWith('.json'));

    // 모든 의원 정보 수집
    const allMembers = new Map(); // key: 이름+정당, value: MEMBER_NO
    
    files.forEach(file => {
      const voteData = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
      const members = voteData.nojepdqqaweusdfbi[1].row;
      
      members.forEach(member => {
        const key = `${member.HG_NM}_${member.POLY_NM}`;
        if (!allMembers.has(key)) {
          allMembers.set(key, member.MEMBER_NO);
        }
      });
    });

    // member22.json 읽기 및 업데이트
    const member22Path = path.join(dataDir, 'member22.json');
    const member22Data = JSON.parse(fs.readFileSync(member22Path, 'utf8'));

    // MEMBER_NO 매핑
    member22Data.members = member22Data.members.map(member => {
      const key = `${member.name}_${member.party}`;
      const memberNo = allMembers.get(key);

      if (memberNo) {
        return {
          ...member,
          memberNo
        };
      }

      console.warn(`No MEMBER_NO found for member: ${member.name} (${member.party})`);
      return member;
    });

    // 업데이트된 데이터 저장
    fs.writeFileSync(member22Path, JSON.stringify(member22Data, null, 2));
    console.log('Successfully updated member22.json with MEMBER_NOs');

  } catch (error) {
    console.error('Failed to collect MEMBER_NOs:', error);
  }
}

fetchMemberMonaCodes(); 