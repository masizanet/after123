// import { logDebug } from '@/lib/utils/debug';
import { AssemblyMemberByAge } from '@/types/member';
import { MEMBER_API } from '@/constants/apis';

export async function fetchAssemblyMembersByAge(
    params: Record<string, string> = {}
  ): Promise<{ 
    members: AssemblyMemberByAge[]; 
    totalCount: number 
  }> {
    try {
      const defaultParams = new URLSearchParams({
        key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
        type: 'json',
        pIndex: '1',
        pSize: '300',
        DAESU: '22' // 22대 국회의원 필터링
      });
  
      // 추가 파라미터 병합
      Object.entries(params).forEach(([key, value]) => {
        defaultParams.append(key, value);
      });
  
      const url = `${MEMBER_API}?${defaultParams.toString()}`;
      console.log('Full API URL:', url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      
      console.log('Raw API response:', JSON.stringify(result, null, 2));
  
      // 새로운 API 응답 구조에 맞게 멤버 데이터 추출
      const members = result.data?.row || result.row || [];
  
      console.log('Extracted members:', members);
  
      return {
        members,
        totalCount: members.length
      };
    } catch (error) {
      console.error('국회의원 데이터 fetching 중 오류:', error);
      return { 
        members: [], 
        totalCount: 0 
      };
    }
  }
  