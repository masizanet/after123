import { TRACKED_BILL_NUMBERS } from '@/constants/bills';

// TRACKED_BILL_NUMBERS 사용 예시 추가
export function getTrackedBillCount() {
  return TRACKED_BILL_NUMBERS.length;
}

export interface Bill {
    BILL_ID: string;
    BILL_NO: string;
    BILL_KND: string;
    BILL_NM: string;
    PPSR_KND: string;
    PPSR_NM: string;
    PPSR: string;
    PPSL_DT: string;
    JRCMIT_NM: string;
    RGS_CONF_RSLT: string | null;
    LINK_URL: string;
    RGS_RSLN_DT?: string; // 선택적 속성 추가
    hasVoteResult?: boolean;  // 옵셔널 필드 추가
  }
  
  interface ApiResult {
    CODE: string;
    MESSAGE: string;
  }
  
  interface ApiHead {
    head: [
      { list_total_count: number },
      { RESULT: ApiResult }
    ]
  }
  
  interface ApiData {
    row?: Bill[];
  }
  
  export interface BillsResponse {
    ALLBILL: [ApiHead, ApiData];
  }

export interface BillDetail {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NM: string;
  PPSL_DT: string;
  RGS_CONF_RSLT: string;
  RGS_RSLN_DT: string;
  PROC_RESULT_CD: string;
  PPSR: string;
  JRCMIT_NM: string;
}

export interface VoteResult {
  BILL_ID: string;
  PROC_DT: string;
  BILL_NO: string;
  BILL_NAME: string;
  CURR_COMMITTEE: string;
  PROC_RESULT_CD: string;
  MEMBER_TCNT: string;   // 재적의원
  VOTE_TCNT: string;     // 총투표수
  YES_TCNT: string;      // 찬성
  NO_TCNT: string;       // 반대
  BLANK_TCNT: string;    // 기권
  LINK_URL: string;
}

export interface APIVoteMember {
  POLY_NM: string;        // 정당명
  HG_NM: string;         // 의원 이름
  ORIG_NM: string;       // 지역구
  VOTE_DT: string;       // 표결일시
  BILL_NO: string;       // 의안번호
  BILL_NM: string;       // 의안명
  RESULT_VOTE_MOD: string;  // 표결 결과 (찬성/반대/기권)
  MONA_CD: string;       // 의원 고유 ID
  PROC_RESULT?: string;  // 불참 등 처리 결과
}

export interface VoteMemberList {
  id: string;
  type: 'yes' | 'no' | 'abstain' | 'absent';
  count: number;
  members: string[];
}

export interface BillsData {
  [key: string]: {
    detail: BillDetail;
    voteResult?: VoteResult;
    voteMembers?: any[];
    billNo: string;
  };
}