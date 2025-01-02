import { Suspense } from 'react';
import MemberDetailClient from './MemberDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

async function generateStaticParams() {
  return [];
}

async function Page({ params }: Props) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <MemberDetailClient id={resolvedParams.id} />
    </Suspense>
  );
}

export { generateStaticParams };
export default Page;