"use client";

import React from 'react';
import { PPL_EVENTS } from '@/constants/pplEvents';
import styles from './PPLEventList.module.css';
import { VoteDetail } from './VoteDetail';
import type { BillDetail as BillDetailType, VoteResult } from '@/types/bill';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
    detail: BillDetailType;
    voteResult: VoteResult | null;
    isImportant?: boolean;
}

export function PPLEventList({ detail, voteResult, isImportant = false }: Props) {
    return (
        <div className={styles.container}>
            <div className={styles.timeline}>
            {PPL_EVENTS.map(event => (
                <article key={event.id} className={styles.event}>
                <header className={styles.eventHeader}>
                <time className={styles.date}>{event.date}</time>
                
                <h2 className={styles.eventTitle}>
                {event.type === 'participate' ? event.title : (
                    <Link href={`/bills/${event.id}`}>{event.title}</Link>
                )}
                </h2>
                
                </header>
                
                <p className={styles.description}>{event.description}</p>
                {event.type !== 'participate' && voteResult && (
                    <VoteDetail 
                        billId={detail.BILL_ID} 
                        voteResult={voteResult}
                        isImportant={isImportant}
                    />
                )}
                {event.type === 'participate' && event.members && (
                    <div className={styles.memberList}>
                    <section className={styles.memberSection}>
                    <h3>국회의원 ({event.members.lawmakers.length}명)</h3>
                    <ul>
                    {event.members.lawmakers.map(name => (
                        <li key={name}>{name}</li>
                    ))}
                    </ul>
                    </section>
                    {event.members.partyChairs && (
                        <section className={styles.memberSection}>
                        <h3>당협위원장 ({event.members.partyChairs.length}명)</h3>
                        <ul>
                        {event.members.partyChairs.map(name => (
                            <li key={name}>{name}</li>
                        ))}
                        </ul>
                        </section>
                    )}
                    </div>
                )}
                </article>
            ))}
            </div>
        </div>
    );
} 