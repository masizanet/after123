import { fetchBillDetail, fetchVoteResult, fetchTrackedBills } from '@/lib/api/bills';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BillDetailContent } from './BillDetail';
import type { BillDetail, VoteResult } from '@/types/bill';

type Params = {
  id: string;
};

type SearchParams = { [key: string]: string | string[] | undefined };

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  await props.searchParams;

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

export default async function BillDetailPage(props: PageProps) {
  const { id } = await props.params;
  await props.searchParams;
  
  const [billDetailData, voteResultData] = await Promise.all([
    fetchBillDetail(id),
    fetchVoteResult(id)
  ]) as [BillDetail | null, VoteResult | null];

  if (!billDetailData || !voteResultData) {
    notFound();
  }

  // 타입 단언으로 명확하게 타입을 지정
  const billDetail: BillDetail = billDetailData;
  const voteResult: VoteResult = voteResultData;

  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <BillDetailContent billDetail={billDetail} voteResult={voteResult} />
    </Suspense>
  );
}

export async function generateStaticParams(): Promise<Params[]> {
  const { bills } = await fetchTrackedBills();
  const billsWithVote = await Promise.all(
    bills.map(async (bill) => {
      const hasVote = await fetchVoteResult(bill.BILL_ID);
      return { id: bill.BILL_ID, hasVote };
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