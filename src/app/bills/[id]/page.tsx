// src/app/bills/[id]/page.tsx
import type { Metadata } from 'next';
import { getBillData } from '@/lib/api/bills';
import BillDetail from './BillDetail';
import { BILL_METADATA } from '@/constants/bills';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const billData = await getBillData(id);
  if (!billData) {
    return {
      title: '의안을 찾을 수 없습니다',
    };
  }

  const customDescription = BILL_METADATA[billData.detail.BILL_NO]?.description;
  const description = customDescription || 
    `${billData.detail.BILL_NM} - ${billData.detail.PPSR} 발의, ${billData.detail.PPSL_DT} 제안`;

  return {
    title: billData.detail.BILL_NM,
    description,
    openGraph: {
      title: billData.detail.BILL_NM,
      description,
      type: 'article',
      publishedTime: billData.detail.PPSL_DT,
      modifiedTime: billData.detail.RGS_RSLN_DT || billData.detail.PPSL_DT,
    },
    twitter: {
      card: 'summary',
      title: billData.detail.BILL_NM,
      description,
    }
  };
}

async function Page({ params }: Props) {
  const { id } = await params;
  const billData = await getBillData(id);

  if (!billData) {
    return <div>의안을 찾을 수 없습니다.</div>;
  }

  const isImportant = id.includes('2206205');

  return (
    <BillDetail 
      detail={billData.detail}
      voteResult={billData.voteResult}
      isImportant={isImportant}
    />
  );
}

export default Page;
