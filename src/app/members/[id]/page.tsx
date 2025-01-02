import { Suspense } from 'react';
import MemberDetailClient from './MemberDetailClient';

export default async function Page({
  params,
}: {
  params: { id: string }
}) {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <MemberDetailClient id={params.id} />
    </Suspense>
  );
}