import React, { useState } from 'react';
import styles from './VoteDetail.module.css';
import billsData from '@/data/bills.json';
import type { BillsData } from '@/types/bill';
import { BILL_2206205_ABSENTEES } from '@/constants/absentMembers';

// 모든 vote-members 파일을 직접 import
import voteMembers2200819 from '@/data/vote-members-2200819.json';
import voteMembers2203837 from '@/data/vote-members-2203837.json';
import voteMembers2206197 from '@/data/vote-members-2206197.json';
import voteMembers2206226 from '@/data/vote-members-2206226.json';
import voteMembers2207082 from '@/data/vote-members-2207082.json';
import voteMembers2207147 from '@/data/vote-members-2207147.json';

// vote-members 데이터 매핑
const voteMembersMap: Record<string, any> = {
  '2200819': voteMembers2200819,
  '2203837': voteMembers2203837,
  '2206197': voteMembers2206197,
  '2206226': voteMembers2206226,
  '2207082': voteMembers2207082,
  '2207147': voteMembers2207147,
};

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
  isImportant: boolean;
}

const bills = billsData as BillsData;

function getTypeLabel(type: string | null) {
  switch (type) {
    case 'absent': return '불참';
    case 'yes': return '찬성';
    case 'no': return '반대';
    case 'blank': return '기권/무효';
    default: return '';
  }
}

function groupMembersByParty(members: Member[]) {
  return members.reduce((groups, member) => {
    const party = member.party;
    if (!groups[party]) {
      groups[party] = [];
    }
    groups[party].push(member);
    return groups;
  }, {} as Record<string, Member[]>);
}

function getVoteData(billNo: string) {
  const voteMembers = voteMembersMap[billNo];
  if (!voteMembers) {
    console.warn(`No vote data found for bill ${billNo}`);
    return [];
  }
  return voteMembers.nojepdqqaweusdfbi[1].row;
}

export function VoteDetail({ billId, voteResult, isImportant }: VoteDetailProps) {
  const [memberDetails, setMemberDetails] = useState<Member[] | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (type: 'absent' | 'yes' | 'no' | 'blank') => {
    showMemberDetails(type);
  };

  const showMemberDetails = (type: 'absent' | 'yes' | 'no' | 'blank') => {
    if (selectedType === type && memberDetails !== null) {
      setMemberDetails(null);
      setSelectedType(null);
      return;
    }

    setSelectedType(type);
    
    let filteredMembers: Member[] = [];
    
    if (billId.includes('2206205') && type === 'absent') {
      filteredMembers = BILL_2206205_ABSENTEES.map(member => ({
        id: member.name,
        name: member.name,
        party: member.party
      }));
    } else {
      const billData = bills[billId];
      if (!billData?.detail?.BILL_NO) {
        console.error('Invalid bill ID:', billId);
        return;
      }

      console.log('Getting vote data for bill:', billData.detail.BILL_NO);
      const voteData = billData.voteMembers || [];
      console.log('Vote data:', voteData);
      
      filteredMembers = voteData
        .filter(m => {
          const result = m.RESULT_VOTE_MOD;
          console.log('Vote result for member:', m.HG_NM, result);
          switch (type) {
            case 'yes': return result === '찬성';
            case 'no': return result === '반대';
            case 'blank': return result === '기권';
            case 'absent': return result === '불참';
            default: return false;
          }
        })
        .map(m => ({
          id: m.MONA_CD,
          name: m.HG_NM,
          party: m.POLY_NM
        }));
    }

    console.log('Filtered members:', filteredMembers);
    setMemberDetails(filteredMembers);
  };

  const stats = {
    absent: String(parseInt(voteResult.MEMBER_TCNT) - parseInt(voteResult.VOTE_TCNT)),
    participation: ((parseInt(voteResult.VOTE_TCNT) / parseInt(voteResult.MEMBER_TCNT)) * 100).toFixed(1)
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <button 
          onClick={() => handleClick('absent')}
          className={`${styles.voteButton} ${
            isImportant ? styles.buttonImportantAbsent : styles.buttonAbsent
          } ${selectedType === 'absent' ? styles.selected : ''}`}
        >
          <span className={styles.label}>불참</span>
          <span className={styles.count}>{stats.absent}명</span>
        </button>

        <button 
          onClick={() => handleClick('yes')}
          className={`${styles.voteButton} ${styles.buttonYes} ${
            selectedType === 'yes' ? styles.selected : ''
          }`}
        >
          <span className={styles.label}>찬성</span>
          <span className={styles.count}>{voteResult.YES_TCNT}명</span>
        </button>

        <button 
          onClick={() => handleClick('no')}
          className={`${styles.voteButton} ${styles.buttonNo} ${
            selectedType === 'no' ? styles.selected : ''
          }`}
        >
          <span className={styles.label}>반대</span>
          <span className={styles.count}>{voteResult.NO_TCNT}명</span>
        </button>

        {parseInt(voteResult.BLANK_TCNT) > 0 && (
          <button 
            onClick={() => handleClick('blank')}
            className={`${styles.voteButton} ${styles.buttonBlank} ${
              selectedType === 'blank' ? styles.selected : ''
            }`}
          >
            <span className={styles.label}>기권/무효</span>
            <span className={styles.count}>{voteResult.BLANK_TCNT}명</span>
          </button>
        )}

        <div className={`${styles.voteButton} ${styles.buttonStats}`}>
          <span className={styles.label}>총여율</span>
          <span className={styles.count}>{stats.participation}%</span>
        </div>
      </div>

      {(selectedType && memberDetails) && (
        <div className={styles.memberList}>
          <div className={styles.memberListHeader}>
            <h3 className={styles.memberListTitle}>
              {getTypeLabel(selectedType)} 의원 명단
            </h3>
          </div>
          
          <div className={styles.memberPartyGroups}>
            {Object.entries(groupMembersByParty(memberDetails))
              .sort(([partyA], [partyB]) => partyA.localeCompare(partyB))
              .map(([party, members]) => (
                <div key={party} className={styles.partyGroup}>
                  <h4 className={styles.partyName}>
                    {party} ({members.length}명)
                  </h4>
                  <div className={styles.memberGrid}>
                    {members
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((member) => (
                        <div key={member.id} className={styles.memberItem}>
                          <div className={styles.memberName}>{member.name}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}