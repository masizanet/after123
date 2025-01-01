import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Member {
  id: string;
  name: string;
  party: string;
  district: string;
  committee: string[];
  type: string;
  gender: string;
  electedCount: string;
}

type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const memberData: { members: Member[] } = require('@/data/member22.json');

export async function generateMetadata({  params 
}: { 
 params: { id: string } 
}): Promise<Metadata> {
  const member = memberData.members.find(m => m.id === params.id);
  
  if (!member) {
    return {
      title: '의원 정보를 찾을 수 없습니다',
    };
  }

  return {
    title: `${member.name} 의원 - ${member.party}`,
    description: `${member.district} 지역구, ${member.committee.join(', ')}`,
  };
}

export default function MemberPage({ params 
}: {
 params: { id: string }
}) {

  // console.log('Requested ID:', params.id);
  // console.log('Available IDs:', memberData.members.map(m => m.id));
  
  const member = memberData.members.find(m => m.id === params.id);

  if (!member) {
    notFound();
  }

  return (
    <div>
      <h1>{member.name} 의원</h1>
      <div>
        <div><span>소속정당:</span> {member.party}</div>
        <div><span>지역구:</span> {member.district}</div>
        <div><span>선출방법:</span> {member.type}</div>
        <div><span>소속위원회:</span> {member.committee.join(', ')}</div>
        <div><span>선수:</span> {member.electedCount}</div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return memberData.members.map(member => ({
    id: member.id
  }));
}