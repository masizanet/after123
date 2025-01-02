const fs = require('fs');
const path = require('path');

// 2207082 의안의 데이터만 사용
const members2207082Raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/vote-members-2207082.json'), 'utf8'));
const member22Data = require('../src/data/member22.json');

const members2207082 = members2207082Raw.nojepdqqaweusdfbi?.[1]?.row || [];

const compareMembers = () => {
  console.log(`Found ${members2207082.length} members in 2207082`);
  
  // 각 의원의 MONA_CD 매핑
  const updatedMembers = member22Data.members.map(member => {
    const apiMember = members2207082.find(m => m.HG_NM === member.name);
    return {
      ...member,
      monaCode: apiMember?.MONA_CD || ''
    };
  });

  // 매핑되지 않은 의원 확인
  const unmappedMembers = updatedMembers.filter(member => !member.monaCode);
  
  if (unmappedMembers.length > 0) {
    console.log('\nWarning: Following members were not mapped:');
    unmappedMembers.forEach(member => {
      console.log(`- ${member.name} (${member.party})`);
    });
  }

  // 업데이트된 데이터 저장
  fs.writeFileSync(
    path.join(__dirname, '../src/data/member22.json'),
    JSON.stringify({ members: updatedMembers }, null, 2),
    'utf8'
  );

  console.log('\nSuccessfully updated member22.json with MONA_CD values');
};

compareMembers(); 