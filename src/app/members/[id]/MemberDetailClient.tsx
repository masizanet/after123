'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface MemberDetail {
  HG_NM: string;       // 이름
  POLY_NM: string;     // 정당명
  ORIG_NM: string;     // 지역구
  CMITS: string;       // 소속위원회
  TEL_NO: string;      // 전화번호
  E_MAIL: string;      // 이메일
  HOMEPAGE: string;    // 홈페이지
}

interface Props {
  id: string;
}

export default function MemberDetailClient({ id }: Props) {
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMemberDetail() {
      try {
        const response = await fetch(`/api/members/${id}`);
        const data = await response.json();
        setMember(data);
      } catch (error) {
        console.error('Failed to fetch member detail:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMemberDetail();
  }, [id]);

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!member) {
    return <div className={styles.error}>의원 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navigation}>
        <div className={styles.navButtons}>
          <button onClick={() => router.back()} className={styles.backButton}>
            ← 이전 페이지
          </button>
          <Link href="/" className={styles.homeButton}>
            홈으로
          </Link>
        </div>
      </nav>

      <main className={styles.content}>
        <article>
          <header>
            <h1 className={styles.title}>{member.HG_NM} 의원</h1>
          </header>

          <dl className={styles.info}>
            <dt className={styles.label}>소속정당</dt>
            <dd className={styles.value}>{member.POLY_NM}</dd>
            
            <dt className={styles.label}>지역구</dt>
            <dd className={styles.value}>{member.ORIG_NM || '비례대표'}</dd>
            
            <dt className={styles.label}>소속위원회</dt>
            <dd>
              <ul className={styles.committeeList}>
                {member.CMITS.split(',').map((committee, index) => (
                  <li key={index} className={styles.committeeItem}>
                    {committee.trim()}
                  </li>
                ))}
              </ul>
            </dd>

            {member.TEL_NO && (
              <>
                <dt className={styles.label}>전화번호</dt>
                <dd className={styles.value}>{member.TEL_NO}</dd>
              </>
            )}

            {member.E_MAIL && (
              <>
                <dt className={styles.label}>이메일</dt>
                <dd className={styles.value}>{member.E_MAIL}</dd>
              </>
            )}

            {member.HOMEPAGE && (
              <>
                <dt className={styles.label}>홈페이지</dt>
                <dd className={styles.value}>
                  <a 
                    href={member.HOMEPAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    바로가기 →
                  </a>
                </dd>
              </>
            )}
          </dl>
        </article>
      </main>
    </div>
  );
} 