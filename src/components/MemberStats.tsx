'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchMemberProfile, fetchMemberAttendance, MemberProfile, MemberAttendance } from '@/lib/api/member';
import styles from './MemberStats.module.css';

interface Props {
  id: string;
}

export function MemberStats({ id }: Props) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [attendance, setAttendance] = useState<MemberAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMemberData() {
      try {
        const profileData = await fetchMemberProfile(id);
        const attendanceData = await fetchMemberAttendance(id);

        if (profileData) setProfile(profileData);
        if (attendanceData) setAttendance(attendanceData);
      } catch (error) {
        console.error('Failed to load member data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMemberData();
  }, [id]);

  if (isLoading) return <div>통계 정보를 불러오는 중...</div>;
  if (!profile && !attendance) return null;

  return (
    <section className={styles.stats}>
      {profile?.IMG_URL && (
        <div className={styles.photoContainer}>
          <Image
            src={profile.IMG_URL}
            alt={profile.HG_NM}
            className={styles.photo}
            width={120}
            height={156}
          />
        </div>
      )}
      
      {attendance && (
        <div className={styles.attendance}>
          <h3>본회의 출석 현황</h3>
          <dl className={styles.attendanceStats}>
            <div className={styles.statItem}>
              <dt>출석률</dt>
              <dd>{attendance.ATTEND_RATE}%</dd>
            </div>
            <div className={styles.statItem}>
              <dt>출석</dt>
              <dd>{attendance.ATTEND_CNT}회</dd>
            </div>
            <div className={styles.statItem}>
              <dt>결석</dt>
              <dd>{attendance.ABSENT_CNT}회</dd>
            </div>
            <div className={styles.statItem}>
              <dt>청가</dt>
              <dd>{attendance.LEAVE_CNT}회</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
} 