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
    PPSL_DT: string;
    JRCMIT_NM: string;
    RGS_CONF_RSLT: string | null;
    LINK_URL: string;
    RGS_RSLN_DT?: string; // 선택적 속성 추가
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
  BILL_ID: string;            // 의안ID
  BILL_NO: string;            // 의안번호
  BILL_NM: string;           // 의안명
  PPSR_KIND: string;         // 제안자구분
  PPSR: string;              // 제안자
  PPSL_DT: string;           // 제안일
  PPSL_SESS: string;         // 제안회기
  JRCMIT_NM: string;         // 소관위원회명
  JRCMIT_CMMT_DT: string | null;    // 소관위원회 회부일
  JRCMIT_PRSNT_DT: string | null;   // 소관위원회 상정일
  JRCMIT_PROC_DT: string | null;    // 소관위원회 처리일
  JRCMIT_PROC_RSLT: string | null;  // 소관위원회 처리결과
  LAW_CMMT_DT: string | null;       // 법사위 체계자구심사 회부일
  LAW_PRSNT_DT: string | null;      // 법사위 체계자구심사 상정일
  LAW_PROC_DT: string | null;       // 법사위 체계자구심사 처리일
  LAW_PROC_RSLT: string | null;     // 법사위 체계자구심사 처리결과
  RGS_PRSNT_DT: string | null;      // 본회의 심의 상정일
  RGS_RSLN_DT: string | null;       // 본회의 심의 의결일
  RGS_CONF_NM: string | null;       // 본회의 심의 회의명
  RGS_CONF_RSLT: string | null;     // 본회의 심의결과
  GVRN_TRSF_DT: string | null;      // 정부 이송일
  PROM_LAW_NM: string | null;       // 공포 법률명
  PROM_DT: string | null;           // 공포일
  PROM_NO: string | null;           // 공포번호
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