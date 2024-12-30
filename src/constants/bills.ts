export const TRACKED_BILL_NUMBERS = [
    '2206448',
    '2206312',
    '2206313',
    '2206314',
    '2206435',
    '2206961',
    '2206349',
    '2206348',
    '2206289',
    '2206269',
    '2206226',
    '2206206',
    '2206205'
  ] as const;
  
  // 필요한 경우 의안별 메타 정보도 추가할 수 있습니다
  export const BILL_METADATA: Record<string, { description?: string }> = {
    '2206448': { description: '대통령(윤석열) 탄핵소추안' },
    // ... 필요한 경우 다른 의안들에 대한 메타데이터 추가
  };