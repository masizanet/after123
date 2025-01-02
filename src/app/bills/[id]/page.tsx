// src/app/bills/[id]/page.tsx
import { getBillData } from '@/lib/api/bills';
import BillDetail from './BillDetail';

type Props = {
  params: Promise<{ id: string }>;
};

async function generateStaticParams() {
  return [];
}

async function Page({ params }: Props) {
  const resolvedParams = await params;
  const billData = await getBillData(resolvedParams.id);

  if (!billData) {
    return <div>의안을 찾을 수 없습니다.</div>;
  }

  const isImportant = resolvedParams.id.includes('2206205');

  return (
    <BillDetail 
      detail={billData.detail}
      voteResult={billData.voteResult}
      isImportant={isImportant}
    />
  );
}

export { generateStaticParams };
export default Page;
