'use client';

import React, { useState } from 'react';
import { fetchVoteMembers } from '@/lib/api/bills';
import styles from './VoteMembersView.module.css';
import type { VoteResult } from '@/types/bill';
import type { Member22 } from '@/types/member';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  party: string;
  voteResult: string;
  district?: string;
}

interface VoteMembersViewProps {
  billId: string;
  voteResult: any;
  emphasizeAbsent: boolean;
  member22Data: any[];
}

export default function VoteMembersView({ 
  billId, 
  voteResult, 
  emphasizeAbsent, 
  member22Data = []
}: VoteMembersViewProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, Member[]> | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.container}>
      {/* 기존 통계 표시 부분 유지 */}
      
      {members && (
        <>
          <h3 className={styles.memberListTitle}>
            {selectedType === 'yes' && '찬성'}
            {selectedType === 'no' && '반대'}
            {selectedType === 'blank' && '기권'}
            {selectedType === 'absent' && '불참'}
            {' '}의원 명단
          </h3>
          
          {Object.entries(members)
            .sort(([partyA], [partyB]) => partyA.localeCompare(partyB))
            .map(([party, partyMembers]) => (
              <div key={party}>
                <h4 className={styles.partyName}>
                  <span>{party}</span>
                  <span className={styles.partyCount}>{partyMembers.length}명</span>
                </h4>
                <div className={styles.memberGrid}>
                  {partyMembers
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((member) => (
                      <Link 
                        href={`/members/${member.id}`} 
                        key={member.id} 
                        className={styles.member}
                      >
                        {member.name} {member.district && `(${member.district})`}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}