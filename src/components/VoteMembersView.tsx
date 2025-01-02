'use client';

import React from 'react';
import styles from './VoteMembersView.module.css';
import type { Member } from '@/types/bill';
import { getPartyColor } from '@/constants/partyColors';
import { getContrastTextColor } from '@/lib/utils/color';

interface Props {
  members: Member[];
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

export function VoteMembersView({ members }: Props) {
  const groupedMembers = groupMembersByParty(members);

  return (
    <div className={styles.container}>
      {Object.entries(groupedMembers)
        .sort(([partyA], [partyB]) => partyA.localeCompare(partyB))
        .map(([party, partyMembers]) => {
          const partyColor = getPartyColor(party);
          const textColor = getContrastTextColor(partyColor.main);

          return (
            <div key={party} className={styles.partyGroup}>
              <h3 
                className={styles.partyName}
                style={{ 
                  backgroundColor: partyColor.main,
                  color: textColor
                }}
              >
                {party} ({partyMembers.length}명)
              </h3>
              <div className={styles.memberGrid}>
                {partyMembers.map((member) => (
                  <span key={member.name} className={styles.member}>
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}