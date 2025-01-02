const path = require('path');
const { fetchVoteMembers } = require(path.join(process.cwd(), 'src/lib/api/bills'));
const fs = require('fs').promises;

async function collectMonaCodes() {
  try {
    // 두 의안에서 투표 멤버 정보를 가져옴
    const [members2207082, members2206197] = await Promise.all([
      fetchVoteMembers('2207082'),
      fetchVoteMembers('2206197')
    ]);
    
    // 두 의안의 멤버 데이터 병합
    const combinedMembers = [...members2207082];
    members2206197.forEach(member => {
      if (!combinedMembers.some(m => m.HG_NM === member.HG_NM)) {
        combinedMembers.push(member);
      }
    });
    
    // 기존 member22.json 파일 읽기
    const member22Path = path.join(process.cwd(), 'src/data/member22.json');
    const member22Raw = await fs.readFile(member22Path, 'utf8');
    const member22Data = JSON.parse(member22Raw);

    // 각 의원의 MONA_CD 매핑
    const updatedMembers = member22Data.members.map(member => {
      const apiMember = combinedMembers.find(m => m.HG_NM === member.name);
      return {
        ...member,
        monaCode: apiMember?.MONA_CD || ''
      };
    });

    // 업데이트된 데이터 저장
    await fs.writeFile(
      member22Path,
      JSON.stringify({ members: updatedMembers }, null, 2),
      'utf8'
    );

    console.log('Successfully updated member22.json with MONA_CD values');
    
    // 매핑되지 않은 의원 확인
    const unmappedMembers = member22Data.members.filter(member => 
      !combinedMembers.some(m => m.HG_NM === member.name)
    );
    
    if (unmappedMembers.length > 0) {
      console.log('\nWarning: Following members were not mapped:');
      unmappedMembers.forEach(member => {
        console.log(`- ${member.name} (${member.party})`);
      });
    }

    // 두 의안 간의 차이점 확인
    const diffMembers = members2207082
      .filter(m1 => !members2206197.some(m2 => m2.HG_NM === m1.HG_NM))
      .concat(members2206197.filter(m2 => !members2207082.some(m1 => m1.HG_NM === m2.HG_NM)));

    if (diffMembers.length > 0) {
      console.log('\nMembers different between two bills:');
      diffMembers.forEach(member => {
        console.log(`- ${member.HG_NM} (${member.POLY_NM})`);
      });
    }

  } catch (error) {
    console.error('Failed to collect MONA_CD values:', error);
  }
}

collectMonaCodes(); 