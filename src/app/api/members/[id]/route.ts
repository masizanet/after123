import { NextResponse } from 'next/server';
import member22Data from '@/data/member22.json';
import { type NextRequest } from 'next/server';
import { MEMBER_PROFILE_API } from '@/constants/apis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const member = member22Data.members.find(m => m.memberNo === id);
    
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const params = new URLSearchParams({
      Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
      Type: 'json',
      pIndex: '1',
      pSize: '1',
      HG_NM: member.name
    });

    const response = await fetch(`${MEMBER_PROFILE_API}?${params.toString()}`);
    const data = await response.json();
    console.log('API Response:', data);
    const profileData = data?.nwvrqwxyaytdsfvhu?.[1]?.row?.[0];

    const memberDetail = {
      HG_NM: member.name,
      POLY_NM: member.party,
      ORIG_NM: profileData?.ORIG_NM || '',
      CMITS: profileData?.CMITS || '',
      TEL_NO: profileData?.TEL_NO || '',
      E_MAIL: profileData?.E_MAIL || '',
      HOMEPAGE: profileData?.HOMEPAGE || '',
      REELE_GBN_NM: profileData?.REELE_GBN_NM || '',
      UNITS: profileData?.UNITS || '',
      ASSEM_ADDR: profileData?.ASSEM_ADDR || '',
      HJ_NM: profileData?.HJ_NM || '',
      ENG_NM: profileData?.ENG_NM || '',
      BTH_DATE: profileData?.BTH_DATE || '',
      STAFF: profileData?.STAFF || '',
      SECRETARY: profileData?.SECRETARY || '',
      SECRETARY2: profileData?.SECRETARY2 || '',
      photoUrl: member.photoUrl || ''
    };

    console.log('Member Detail:', memberDetail);

    return NextResponse.json(memberDetail);
  } catch (error) {
    console.error(`Failed to get member detail:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 