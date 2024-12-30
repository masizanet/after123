import React, { useState } from 'react';
import styles from './VoteDetail.module.css';

interface Member {
  id: string;
  name: string;
  party: string;
}

interface VoteResult {
  MEMBER_TCNT: string;
  VOTE_TCNT: string;
  YES_TCNT: string;
  NO_TCNT: string;
  BLANK_TCNT: string;
}

interface VoteDetailProps {
  billId: string;
  voteResult: VoteResult;
  isImportant?: boolean;
}

function getTypeLabel(type: string | null) {
  switch (type) {
    case 'absent': return '불참';
    case 'yes': return '찬성';
    case 'no': return '반대';
    case 'blank': return '기권';
    default: return '';
  }
}

export function VoteDetail({ billId, voteResult, isImportant }: VoteDetailProps) {
  const [memberDetails, setMemberDetails] = useState<Member[] | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const fetchMemberVoteDetails = async (type: 'absent' | 'yes' | 'no' | 'blank') => {
    if (selectedType === type && memberDetails !== null) {
      setMemberDetails(null);
      setSelectedType(null);
      return;
    }

    setIsLoadingMembers(true);
    setSelectedType(type);
    
    try {
      const response = await fetch(`/api/vote-members?billId=${billId}&voteType=${type}`);
      const data = await response.json();
      setMemberDetails(data.members);
    } catch (error) {
      console.error('Failed to fetch member details:', error);
      setMemberDetails(null);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const stats = {
    absent: String(parseInt(voteResult.MEMBER_TCNT) - parseInt(voteResult.VOTE_TCNT)),
    participation: ((parseInt(voteResult.VOTE_TCNT) / parseInt(voteResult.MEMBER_TCNT)) * 100).toFixed(1)
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <button 
          onClick={() => fetchMemberVoteDetails('absent')}
          className={`${styles.voteButton} ${
            isImportant ? styles.buttonImportantAbsent : styles.buttonAbsent
          } ${selectedType === 'absent' ? styles.selected : ''}`}
        >
          <span className={styles.label}>불참</span>
          <span className={styles.count}>{stats.absent}명</span>
        </button>

        <button 
          onClick={() => fetchMemberVoteDetails('yes')}
          className={`${styles.voteButton} ${styles.buttonYes} ${
            selectedType === 'yes' ? styles.selected : ''
          }`}
        >
          <span className={styles.label}>찬성</span>
          <span className={styles.count}>{voteResult.YES_TCNT}명</span>
        </button>

        <button 
          onClick={() => fetchMemberVoteDetails('no')}
          className={`${styles.voteButton} ${styles.buttonNo} ${
            selectedType === 'no' ? styles.selected : ''
          }`}
        >
          <span className={styles.label}>반대</span>
          <span className={styles.count}>{voteResult.NO_TCNT}명</span>
        </button>

        <button 
          onClick={() => fetchMemberVoteDetails('blank')}
          className={`${styles.voteButton} ${styles.buttonBlank} ${
            selectedType === 'blank' ? styles.selected : ''
          }`}
        >
          <span className={styles.label}>기권</span>
          <span className={styles.count}>{voteResult.BLANK_TCNT}명</span>
        </button>

        <div className={`${styles.voteButton} ${styles.buttonStats}`}>
          <span className={styles.label}>총원 / 참여율</span>
          <span className={styles.count}>{voteResult.MEMBER_TCNT}명 / {stats.participation}%</span>
        </div>
      </div>

      {(isLoadingMembers || memberDetails) && (
        <div className={styles.memberList}>
          <div className={styles.memberListHeader}>
            <h3 className={styles.memberListTitle}>
              {getTypeLabel(selectedType)} 의원 명단
            </h3>
          </div>
          
          {isLoadingMembers ? (
            <div className={styles.loading}>로딩중...</div>
          ) : (
            <div className={styles.memberGrid}>
              {memberDetails?.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberName}>{member.name}</div>
                  <div className={styles.memberParty}>{member.party}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}