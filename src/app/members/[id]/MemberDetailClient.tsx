'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { MemberStats } from '@/components/MemberStats';

interface MemberDetail {
  HG_NM: string;       // 이름
  POLY_NM: string;     // 정당명
  ORIG_NM: string;     // 지역구
  CMITS: string;       // 소속위원회
  TEL_NO: string;      // 전화번호
  E_MAIL: string;      // 이메일
  HOMEPAGE: string;    // 홈페이지
  photoUrl: string;    // 사진 URL
  SEX_GBN_NM: string;  // 성별
  BTH_DATE: string;    // 생년월일
  REELE_GBN_NM: string; // 선수
  JOB_RES_NM: string;  // 직책명
  UNITS: string;       // 당선대수
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
        if (!response.ok) throw new Error('Failed to fetch member detail');
        
        const data = await response.json();
        setMember(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMemberDetail();
  }, [id]);

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
  if (!member) return <div className={styles.error}>의원 정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.container}>
      <nav className={styles.navigation}>
        <div className={styles.navButtons}>
          <button onClick={() => router.back()} className={styles.backButton}>
            ← 뒤로 가기
          </button>
          <Link href="/" className={styles.homeButton}>
            홈으로
          </Link>
        </div>
      </nav>

      <main className={styles.content}>
        <article>
          <div className={styles.profileHeader}>
            {member.photoUrl && (
              <div className={styles.photoContainer}>
                <Image 
                  src={member.photoUrl}
                  alt={member.HG_NM} 
                  className={styles.photo}
                  width={120}
                  height={156}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <header>
              <h1 className={styles.title}>{member.HG_NM}</h1>
              <p className={styles.party}>{member.POLY_NM}</p>
              <p className={styles.district}>{member.ORIG_NM || '비례대표'}</p>
            </header>
          </div>

          <dl className={styles.info}>
            <div className={styles.infoItem}>
              <dt>소속위원회</dt>
              <dd>
                {member.CMITS ? (
                  <ul className={styles.committeeList}>
                    {member.CMITS.split(',').map((committee, index) => (
                      <li key={index} className={styles.committeeItem}>
                        {committee.trim()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  '-'
                )}
              </dd>
            </div>

            {member.REELE_GBN_NM && (
              <div className={styles.infoItem}>
                <dt>선수</dt>
                <dd>{member.REELE_GBN_NM} ({member.UNITS})</dd>
              </div>
            )}

            {member.JOB_RES_NM && (
              <div className={styles.infoItem}>
                <dt>직책명</dt>
                <dd>{member.JOB_RES_NM}</dd>
              </div>
            )}

            {member.BTH_DATE && (
              <div className={styles.infoItem}>
                <dt>생년월일</dt>
                <dd>{member.BTH_DATE}</dd>
              </div>
            )}

            {member.TEL_NO && (
              <div className={styles.infoItem}>
                <dt>전화번호</dt>
                <dd>{member.TEL_NO}</dd>
              </div>
            )}

            {member.E_MAIL && (
              <div className={styles.infoItem}>
                <dt>이메일</dt>
                <dd>{member.E_MAIL}</dd>
              </div>
            )}

            {member.HOMEPAGE && (
              <div className={styles.infoItem}>
                <dt>홈페이지</dt>
                <dd>
                  <a 
                    href={member.HOMEPAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    바로가기 →
                  </a>
                </dd>
              </div>
            )}
          </dl>

          <MemberStats id={id} />
        </article>
      </main>
    </div>
  );
} 