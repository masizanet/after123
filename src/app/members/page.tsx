import { fetchAssemblyMembersByAge } from '@/lib/api/member';
import { AssemblyMemberByAge } from '@/types/member';

export default async function MembersPage() {
  const { members } = await fetchAssemblyMembersByAge();

  // 정당별로 그룹핑 및 가나다 순 정렬
  const membersByParty = members.reduce((acc, member) => {
    const party = member.DAE.split(' ').pop() || '무소속';
    if (!acc[party]) {
      acc[party] = [];
    }
    acc[party].push(member);
    return acc;
  }, {} as Record<string, AssemblyMemberByAge[]>);

  // 정당명 정렬
  const sortedParties = Object.keys(membersByParty).sort();

  return (
    <div>
      <h1>22대 국회의원 명단</h1>
      {sortedParties.map(party => (
        <div key={party}>
          <h2>{party} ({membersByParty[party].length}명)</h2>
          <ul>
            {membersByParty[party]
              .sort((a, b) => a.NAME.localeCompare(b.NAME))
              .map(member => (
                <li key={member.NAME}>
                  {member.NAME} ({member.BIRTH.slice(0,4)}년생)
                </li>
              ))
            }
          </ul>
        </div>
      ))}
    </div>
  );
}
