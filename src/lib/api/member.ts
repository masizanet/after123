import { MEMBER_PROFILE_API } from '@/constants/apis';
import memberList from '@/data/member22.json';

interface Member22 {
  id: string;
  monaCode: string;
  name: string;
  party: string;
  district: string;
  type: string;
  gender: string;
  committee: string[];
  electedCount: string;
  memberNo: string;
  photoUrl: string;
}

export interface MemberProfile {
  HG_NM: string;       // 이름
  POLY_NM: string;     // 정당명
  ORIG_NM: string;     // 지역구
  CMITS: string;       // 소속위원회
  TEL_NO: string;      // 전화번호
  EMAIL: string;       // 이메일
  HOMEPAGE: string;    // 홈페이지
  photoUrl: string;    // 사진 URL
  ENG_NM: string;      // 영문 이름
  ELECT_GBN_NM: string; // 선거구분
  IMG_URL: string;     // 이미지 URL
}

export interface MemberAttendance {
  ATTEND_RATE: number;  // 출석률
  ATTEND_CNT: number;   // 출석 횟수
  ABSENT_CNT: number;   // 결석 횟수
  LEAVE_CNT: number;    // 청가 횟수
}

export const getMemberById = (id: string): Member22 | undefined => {
  return memberList.members.find(member => member.id === id);
};

export const getAllMembers = (): Member22[] => {
  return memberList.members;
};

export async function fetchMemberProfile(memberNo: string): Promise<MemberProfile | null> {
  const member = (memberList.members as Member22[]).find(m => m.memberNo === memberNo);
  if (!member) return null;

  const params = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '1',
    HG_NM: member.name
  });

  const response = await fetch(`${MEMBER_PROFILE_API}?${params.toString()}`);
  const data = await response.json();
  const profileData = data?.nwvrqwxyaytdsfvhu?.[1]?.row?.[0];

  if (profileData) {
    return {
      HG_NM: profileData.HG_NM,
      POLY_NM: profileData.POLY_NM,
      ORIG_NM: profileData.ORIG_NM,
      CMITS: profileData.CMITS,
      TEL_NO: profileData.TEL_NO,
      EMAIL: profileData.EMAIL,
      HOMEPAGE: profileData.HOMEPAGE,
      photoUrl: member.photoUrl,
      ENG_NM: profileData.ENG_NM || '',
      ELECT_GBN_NM: profileData.ELECT_GBN_NM || '',
      IMG_URL: profileData.IMG_URL || ''
    };
  }
  return null;
}

export async function fetchMemberAttendance(memberNo: string): Promise<MemberAttendance | null> {
  const params = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '1',
    HG_NM: memberNo
  });

  const response = await fetch(`${MEMBER_PROFILE_API}?${params.toString()}`);
  const data = await response.json();
  
  const attendanceData = data?.npffdutiapkzbfyvr?.[1]?.row?.[0];
  if (attendanceData) {
    return {
      ATTEND_RATE: Number(attendanceData.ATTEND_RATE) || 0,
      ATTEND_CNT: Number(attendanceData.ATTEND_CNT) || 0,
      ABSENT_CNT: Number(attendanceData.ABSENT_CNT) || 0,
      LEAVE_CNT: Number(attendanceData.LEAVE_CNT) || 0
    };
  }
  return null;
}

// 다른 API 함수들도 유사한 방식으로 구현...