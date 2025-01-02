import { getMemberById } from '@/lib/api/member';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    id: string;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const member = getMemberById(params.id);
  
  if (!member) {
    return {
      title: '의원 정보를 찾을 수 없습니다',
    };
  }

  return {
    title: `${member.name} 의원`,
    description: `${member.party} ${member.district || '비례대표'}`,
  };
}

export default async function MemberDetailPage({ params }: PageProps) {
  const member = getMemberById(params.id);

  if (!member) {
    notFound();
  }

  return (
    <div>
      <h1>{member.name} 의원</h1>
      <div>
        <p>소속: {member.party}</p>
        <p>지역구: {member.district || '비례대표'}</p>
      </div>
      {/* 추가 의원 정보 표시 */}
    </div>
  );
}