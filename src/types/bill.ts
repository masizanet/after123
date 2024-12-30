import { TRACKED_BILL_NUMBERS } from '@/constants/bills';

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
  MEMBER_TCNT: string;
  VOTE_TCNT: string;
  YES_TCNT: string;
  NO_TCNT: string;
  BLANK_TCNT: string;
}
