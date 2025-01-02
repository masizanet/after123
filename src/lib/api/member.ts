import memberData from '@/data/member22.json';
import type { Member22 } from '@/types/member';

// Member22 타입을 사용 (기존 Member 인터페이스는 제거)
const { members: memberList } = memberData as { members: Member22[] };

export const getMemberById = (id: string): Member22 | undefined => {
  return memberList.find(member => member.id === id);
};

export const getAllMembers = (): Member22[] => {
  return memberList;
};