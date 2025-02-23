import React, { useState } from 'react';
import styles from './VoteDetail.module.css';
import billsData from '@/data/bills.json';
import type { BillsData } from '@/types/bill';
import { BILL_2206205_ABSENTEES } from '@/constants/absentMembers';
import { fetchVoteMembers } from '@/lib/api/bills';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import type { Member } from '@/types/bill';
import { getPartyColor } from '@/constants/partyColors';
import { getContrastTextColor } from '@/lib/utils/color';
import { Suspense } from 'react';

interface VoteResult {
  MEMBER_TCNT: string;
  VOTE_TCNT: string;
  YES_TCNT: string;
  NO_TCNT: string;
  BLANK_TCNT: string;
  BILL_NO: string;
}

interface VoteDetailProps {
  billId: string;
  voteResult: VoteResult;
  isImportant: boolean;
}

interface MemberDetail {
  HG_NM: string;
  POLY_NM: string;
  ORIG_NM: string;
  CMITS: string;
}

interface MemberPopover {
  member: Member;
  detail: MemberDetail | null;
  position: { x: number; y: number };
}

const bills = billsData as unknown as BillsData;

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
    const party = member.POLY_NM || '무소속';
    if (!groups[party]) {
      groups[party] = [];
    }
    groups[party].push(member);
    return groups;
  }, {} as Record<string, Member[]>);
}

export function VoteDetail({ billId, voteResult, isImportant = false }: VoteDetailProps) {
  const [memberDetails, setMemberDetails] = useState<Member[] | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [popover, setPopover] = useState<MemberPopover | null>(null);

  const handleClick = (type: 'absent' | 'yes' | 'no' | 'blank') => {
    showMemberDetails(type);
  };

  const showMemberDetails = async (type: 'absent' | 'yes' | 'no' | 'blank') => {
    if (selectedType === type && memberDetails !== null) {
      setMemberDetails(null);
      setSelectedType(null);
      return;
    }

    setPopover(null);
    setSelectedType(type);
    
    let filteredMembers: Member[] = [];
    
    if (billId.includes('2206205') && type === 'absent') {
      filteredMembers = BILL_2206205_ABSENTEES.map(member => ({
        id: member.name,
        name: member.name,
        POLY_NM: member.party,
        region: member.region,
        memberNo: member.name
      }));
    } else {
      const billData = bills[billId];
      if (!billData?.detail?.BILL_NO) {
        console.error('Invalid bill ID:', billId);
        return;
      }

      const voteData = await fetchVoteMembers(billId, billData.detail.BILL_NO);
      
      if (!voteData) {
        console.error('Failed to get vote data');
        return;
      }

      filteredMembers = voteData
        .filter(m => {
          const result = m.RESULT_VOTE_MOD || m.PROC_RESULT;
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
          name: m.HG_NM || m.MONA_NM,
          POLY_NM: m.POLY_NM,
          region: m.ORIG_NM || '비례대표',
          memberNo: m.MEMBER_NO || ''
        }));
    }

    setMemberDetails(filteredMembers);
  };

  const stats = {
    absent: parseInt(voteResult.MEMBER_TCNT) - parseInt(voteResult.VOTE_TCNT),
    participation: ((parseInt(voteResult.VOTE_TCNT) / parseInt(voteResult.MEMBER_TCNT)) * 100).toFixed(1)
  };

  const is2206205 = billId.includes('2206205');

  const handleMemberClick = async (member: Member, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopover({
      member,
      detail: {
        HG_NM: member.name,
        POLY_NM: member.POLY_NM,
        ORIG_NM: member.region,
        CMITS: ''
      },
      position: {
        x: rect.left,
        y: rect.bottom + window.scrollY + 8
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          표결 정보
          <span className={styles.participation}>
            (참여율 {stats.participation}%)
          </span>
        </h2>
      </div>
      <div className={styles.grid}>
        {!is2206205 && (
          <>
            <button 
              onClick={() => handleClick('yes')}
              className={`${styles.voteButton} ${styles.buttonYes} ${
                selectedType === 'yes' ? styles.selected : ''
              }`}
              disabled={parseInt(voteResult.YES_TCNT) === 0}
            >
              <span className={styles.label}>찬성</span>
              <span className={styles.count}>{voteResult.YES_TCNT}명</span>
            </button>

            <button 
              onClick={() => handleClick('no')}
              className={`${styles.voteButton} ${styles.buttonNo} ${
                selectedType === 'no' ? styles.selected : ''
              }`}
              disabled={parseInt(voteResult.NO_TCNT) === 0}
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
          </>
        )}
        <button 
          onClick={() => handleClick('absent')}
          className={`${styles.voteButton} ${
            isImportant ? styles.buttonImportantAbsent : styles.buttonAbsent
          } ${selectedType === 'absent' ? styles.selected : ''}`}
          disabled={stats.absent === 0}
        >
          <span className={styles.label}>불참</span>
          <span className={styles.count}>{stats.absent}명</span>
        </button>
      </div>
      <Suspense fallback={<div>로딩 중...</div>}>
        {(selectedType && memberDetails) && (
          <div className={styles.memberList}>
            <header className={styles.memberListHeader}>
              <h2 className={styles.memberListTitle}>
                {getTypeLabel(selectedType)} 의원 명단
              </h2>
            </header>
            
            <section className={styles.memberPartyGroups}>
              {Object.entries(groupMembersByParty(memberDetails))
                .sort(([partyA], [partyB]) => partyA.localeCompare(partyB))
                .map(([party, members]) => (
                  <article key={party} className={styles.partyGroup}>
                    <h3 
                      className={styles.partyName}
                      style={{ 
                        backgroundColor: getPartyColor(party).main,
                        color: getContrastTextColor(getPartyColor(party).main)
                      }}
                    >
                      {party} ({members.length}명)
                    </h3>
                    <ul className={styles.memberGrid}>
                      {members
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((member) => (
                          <li key={member.id} className={styles.memberItem}>
                            <button
                              className={styles.memberLink}
                              onClick={(e) => handleMemberClick(member, e)}
                            >
                              {member.name}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </article>
                ))}
            </section>
          </div>
        )}
      </Suspense>

      {popover && createPortal(
        <div 
          className={styles.memberPopover}
          style={{
            left: `${popover.position.x}px`,
            top: `${popover.position.y}px`
          }}
        >
          <button 
            className={styles.closeButton}
            onClick={() => setPopover(null)}
            aria-label="닫기"
          >
            ×
          </button>
          <dl className={styles.popoverInfo}>
            <dt>소속정당</dt>
            <dd>{popover.detail?.POLY_NM}</dd>
            <dt>지역구</dt>
            <dd>{popover.detail?.ORIG_NM || '비례대표'}</dd>
          </dl>
          <Link 
            href={`/members/${popover.member.memberNo}`}
            className={styles.popoverLink}
          >
            상세정보 →
          </Link>
        </div>,
        document.body
      )}
    </div>
  );
}