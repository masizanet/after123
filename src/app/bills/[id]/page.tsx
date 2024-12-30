// src/app/bills/[id]/page.tsx
import { fetchBillDetail, fetchVoteResult, fetchTrackedBills } from '@/lib/api/bills';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BillDetail as BillDetailComponent } from './BillDetail';
import { IMPORTANT_BILL_IDS, TRACKED_BILL_NUMBERS } from '@/constants/bills';
import type { BillDetail, VoteResult } from '@/types/bill';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function BillDetailPage({
  params
}: PageProps) {
  const { id } = params;

  const [billDetail, voteResult] = await Promise.all([
    fetchBillDetail(id),
    fetchVoteResult(id)
  ]) as [BillDetail | null, VoteResult | null];

  if (!billDetail || !voteResult) {
    notFound();
  }

  return (
    <BillDetailComponent
      billDetail={billDetail}
      voteResult={voteResult}
      isImportant={IMPORTANT_BILL_IDS.includes(id as typeof IMPORTANT_BILL_IDS[number])}
    />
  );
}

export async function generateMetadata({
  params: { id }
}: PageProps): Promise<Metadata> {
  const billDetail = await fetchBillDetail(id);
  
  if (!billDetail) {
    return {
      title: '법안 정보를 찾을 수 없습니다',
    };
  }

  return {
    title: billDetail.BILL_NM,
    description: `${billDetail.BILL_NO} - ${billDetail.PPSR}`,
  };
}

export async function generateStaticParams() {
  const { bills } = await fetchTrackedBills();
  const billsWithVote = await Promise.all(
    bills.map(async (bill) => {
      const voteResult = await fetchVoteResult(bill.BILL_ID);
      return { 
        id: bill.BILL_ID, 
        hasVote: voteResult !== null 
      };
    })
  );

  return billsWithVote
    .filter(bill => bill.hasVote)
    .map(bill => ({
      id: bill.id
    }));
}

export const dynamic = 'force-static';
export const revalidate = false;