'use client';

import React, { useState } from 'react';
import { fetchVoteMembers } from '@/lib/api/bills';
import styles from './VoteMembersView.module.css';
import type { VoteResult } from '@/types/bill';
import type { Member22 } from '@/types/member';

interface Member {
  id: string;
  name: string;
  party: string;
  voteResult: string;
  district?: string;
}

interface VoteMembersViewProps {
  billId: string;
  voteResult: VoteResult;
  isImportant?: boolean;
  emphasizeAbsent?: boolean;
  member22Data: Member22[];
}

export default function VoteMembersView({ 
  billId, 
  voteResult, 
  isImportant = false,
  emphasizeAbsent = false,
  member22Data
}: VoteMembersViewProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, Member[]> | null>(null);
  const [loading, setLoading] = useState(false);

  const member22Map = new Map(member22Data.map(m => [m.id, m]));
  const absentCount = parseInt(voteResult.MEMBER_TCNT) - parseInt(voteResult.VOTE_TCNT);
  const participationRate = ((parseInt(voteResult.VOTE_TCNT) / parseInt(voteResult.MEMBER_TCNT)) * 100).toFixed(1);

  const loadMembers = async (type: string) => {
    if (selectedType === type) {
      setSelectedType(null);
      setMembers(null);
      return;
    }

    setLoading(true);
    setSelectedType(type);

    try {
      const allMembers = await fetchVoteMembers(billId);
      
      const filteredMembers = allMembers.filter(member => {
        const result = member.RESULT_VOTE_MOD?.trim();
        if (type === 'yes') return result === '찬성';
        if (type === 'no') return result === '반대';
        if (type === 'blank') return result === '기권';
        if (type === 'absent') return !result || result === '불참';
        return false;
      });

      const groupedMembers = filteredMembers.reduce((acc: Record<string, Member[]>, member) => {
        const party = member.POLY_NM?.trim() || '무소속';
        const member22Info = member22Map.get(member.MONA_CD);
        
        if (!acc[party]) acc[party] = [];
        acc[party].push({
          id: member.MONA_CD,
          name: member22Info?.name || 
            `${member.HG_NM} (${member.ORIG_NM === '비례대표' ? '비례' : member.ORIG_NM})`,
          party: party,
          voteResult: member.RESULT_VOTE_MOD?.trim() || '',
          district: member22Info?.district
        });
        return acc;
      }, {});

      setMembers(groupedMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (emphasizeAbsent) {
      loadMembers('absent');
    }
  }, [emphasizeAbsent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className={`${styles.stats} ${styles.participation}`}>
          <span className={styles.number}>{participationRate}%</span>
          <span className={styles.label}>참여율</span>
        </div>

        <div className={`${styles.stats} ${styles.present}`}>
          <span className={styles.number}>{voteResult.VOTE_TCNT}명</span>
          <span className={styles.label}>참석</span>
        </div>

        <div 
          className={`${styles.stats} ${styles.absent} ${styles.clickable} ${
            selectedType === 'absent' ? styles.selected : ''
          } ${emphasizeAbsent ? styles.emphasized : ''}`}
          onClick={() => loadMembers('absent')}
        >
          <span className={styles.number}>{absentCount}명</span>
          <span className={styles.label}>불참</span>
        </div>

        <div 
          className={`${styles.stats} ${styles.yes} ${styles.clickable} ${
            selectedType === 'yes' ? styles.selected : ''
          }`}
          onClick={() => loadMembers('yes')}
        >
          <span className={styles.number}>{voteResult.YES_TCNT}명</span>
          <span className={styles.label}>찬성</span>
        </div>

        <div 
          className={`${styles.stats} ${styles.no} ${styles.clickable} ${
            selectedType === 'no' ? styles.selected : ''
          }`}
          onClick={() => loadMembers('no')}
        >
          <span className={styles.number}>{voteResult.NO_TCNT}명</span>
          <span className={styles.label}>반대</span>
        </div>

        <div 
          className={`${styles.stats} ${styles.blank} ${styles.clickable} ${
            selectedType === 'blank' ? styles.selected : ''
          }`}
          onClick={() => loadMembers('blank')}
        >
          <span className={styles.number}>{parseInt(voteResult.BLANK_TCNT)}명</span>
          <span className={styles.label}>기권/무효</span>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>의원 목록을 불러오는 중...</div>
      )}

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
                  <div key={member.id} className={styles.member}>
                    {member.name} {member.district && `(${member.district})`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}