// src/constants/bills.ts

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
  '2206205',
  '2206197'
] as const;

export const IMPORTANT_BILL_IDS = [
  '2206205', // 중요 법안
  '2206448'  // 탄핵소추안
] as const;

export const BILL_METADATA: Record<string, { 
  description?: string;
  emphasizeAbsent?: boolean;
}> = {
  '2206448': { 
    description: '대통령(윤석열) 탄핵소추안(2차)'
  },
  '2206205': { 
    description: '대통령(윤석열) 탄핵소추안(1차)',
    emphasizeAbsent: true // 불성립된 법안이므로 불참 강조
  }
};