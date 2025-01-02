// 국회의원 정보 인터페이스 정의
export interface NationalAssemblyMember {
    NAAS_CD: string;        // 국회의원코드
    NAAS_NM: string;        // 국회의원명
    NAAS_CH_NM: string;     // 국회의원 한자명
    NAAS_EN_NM: string;     // 국회의원 영문명
    BIRDY_DIV_CD: string;   // 생일구분코드
    BIRDY_DT: string;       // 생일일자
    DTY_NM: string;         // 직책명
    PLPT_NM: string;        // 정당명
    ELECD_NM: string;       // 선거구명
    ELECD_DIV_NM: string;   // 선거구구분명
    CMIT_NM: string;        // 위원회명
    BLNG_CMIT_NM: string;   // 소속위원회명
    RLCT_DIV_NM: string;    // 재선구분명
    GTELT_ERACO: string;    // 당선대수
    NTR_DIV: string;        // 성별
    NAAS_TEL_NO: string;    // 전화번호
    NAAS_EMAIL_ADDR: string;// 국회의원 이메일
    NAAS_HP_URL: string;    // 국회의원 홈페이지 URL
    AIDE_NM: string;        // 보좌관
    CHF_SCRT_NM: string;    // 비서관
    SCRT_NM: string;        // 비서
    BRF_HST: string;        // 약력
    OFFM_RNUM_NO: string;   // 사무실 호실
  }

  export interface AssemblyMemberByAge {
    DAESU: string;       // 대수
    DAE: string;         // 대별 및 소속정당(단체)
    DAE_NM: string;      // 대별
    NAME: string;        // 이름
    NAME_HAN: string;    // 이름(한자)
    JA: string;          // 자
    HO: string;          // 호
    BIRTH: string;       // 생년월일
    BON: string;         // 본관
    POSI: string;        // 출생지
    HAK: string;         // 학력 및 경력
    HOBBY: string;       // 종교 및 취미
    BOOK: string;        // 저서
    SANG: string;        // 상훈
    DEAD: string;        // 기타정보(사망일)
    URL: string;         // 회원정보 확인 헌정회 홈페이지 URL
  }
  
  
  // API 요청 인터페이스
  export interface ApiRequestParams {
    NAAS_CD?: string;
    NAAS_NM?: string;
    PLPT_NM?: string;
    BLNG_CMIT_NM?: string;
  }
  
  // API 응답 인터페이스
  export interface ApiResponse {
    data: {
      row: NationalAssemblyMember[];
    };
  }

  export interface Member22 {
    id: string;
    name: string;
    party: string;
    district: string;
    type: string;
    gender: string;
    committee: string[];
    electedCount: string;
  }

  export interface MemberProfile {
    HG_NM: string;          // 이름
    ENG_NM: string;         // 영문 이름
    POLY_NM: string;        // 정당명
    ORIG_NM: string;        // 선거구
    ELECT_GBN_NM: string;   // 선출방법
    CMITS: string;          // 소속위원회
    HOMEPAGE: string;       // 홈페이지
    EMAIL: string;          // 이메일
    IMG_URL: string;        // 사진 URL
  }

  export interface MemberAttendance {
    ATTEND_CNT: string;     // 출석수
    ABSENT_CNT: string;     // 결석수
    LEAVE_CNT: string;      // 청가수
    ATTEND_RATE: string;    // 출석률
  }
  