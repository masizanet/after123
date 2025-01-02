// src/app/bills/[id]/page.tsx
import { getBillData } from '@/lib/api/bills';
import BillDetail from './BillDetail';

export default async function Page({
  params,
}: {
  params: { id: string }
}) {
  const billData = await getBillData(params.id);

  if (!billData) {
    return <div>의안을 찾을 수 없습니다.</div>;
  }

  const isImportant = params.id.includes('2206205');

  return (
    <BillDetail 
      detail={billData.detail}
      voteResult={billData.voteResult}
      isImportant={isImportant}
    />
  );
}
