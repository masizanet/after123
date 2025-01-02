import { Suspense } from 'react';
import MemberDetailClient from './MemberDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

async function generateStaticParams() {
  return [];
}

async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <MemberDetailClient id={id} />
    </Suspense>
  );
}

export { generateStaticParams };
export default Page;