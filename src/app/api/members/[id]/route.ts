import { NextResponse } from 'next/server';
import member22Data from '@/data/member22.json';
import { type NextRequest } from 'next/server';

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

    const memberDetail = {
      HG_NM: member.name,
      POLY_NM: member.party,
      ORIG_NM: member.district || '',
      CMITS: member.committee?.join(', ') || '',
      TEL_NO: '',
      E_MAIL: '',
      HOMEPAGE: '',
      MONA_CD: member.monaCode
    };

    return NextResponse.json(memberDetail);
  } catch (error) {
    console.error(`Failed to get member detail:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 