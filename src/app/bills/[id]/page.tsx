// src/app/bills/[id]/page.tsx
import { getBillData } from '@/lib/api/bills';
import { BILL_METADATA } from '@/constants/bills';
import BillDetail from './BillDetail';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const billData = await getBillData(id);
  
  if (!billData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>의안을 찾을 수 없습니다</h1>
          <p>입력하신 의안번호({id})에 해당하는 의안이 없습니다.</p>
        </div>
      </div>
    );
  }

  const emphasizeAbsent = BILL_METADATA[id]?.emphasizeAbsent ?? false;

  return (
    <BillDetail
      billId={id}
      billDetail={billData.detail}
      voteResult={billData.voteResult}
      emphasizeAbsent={emphasizeAbsent}
      members={billData.members}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const billData = await getBillData(id);
  
  if (!billData) {
    return {
      title: '의안을 찾을 수 없습니다',
    };
  }

  return {
    title: billData.detail.BILL_NM,
  };
}
