'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface Member {
  id: string;
  name: string;
  nickname: string;
  contact: string;
  email: string;
  type: string;
}

const members: Member[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `20250401-00${i + 1}`,
  name: `홍길동 ${i + 1}`,
  nickname: `닉네임${i + 1}`,
  contact: `010-0000-000${i}`,
  email: `user${i + 1}@mail.com`,
  type: i % 2 === 0 ? '일반' : 'VIP',
}));

export default function GeneralMemberPage() {
  const router = useRouter();

  const openInvoice = (member: Member) => {
    const query = new URLSearchParams({
      name: member.name,
      nickname: member.nickname,
      email: member.email,
      phone: member.contact,
      addressLine: '경기도 안양시 동안구 흥안대로427번길 57-2 (평촌동)', // default, replace if available
      zipOrDetail: '121112호 546432동', // default, replace if available
    }).toString();

    router.push(
      `/admin/pages/account-permission-management/general-member/regular-member/${member.id}?${query}`
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.col}>이름</div>
        <div className={styles.col}>닉네임</div>
        <div className={styles.col}>연락처</div>
        <div className={styles.col}>이메일</div>
        <div className={styles.col}>회원분류</div>
      </div>

      {members.map((member) => (
        <div
          key={member.id}
          className={styles.dataRow}
          role="button"
          tabIndex={0}
          onClick={() => openInvoice(member)}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && openInvoice(member)
          }
          aria-label={`${member.name} 거래 증빙서류 열기`}
        >
          <div className={styles.col}>{member.name}</div>
          <div className={styles.col}>{member.nickname}</div>
          <div className={styles.col}>{member.contact}</div>
          <div className={styles.col}>{member.email}</div>
          <div className={styles.col}>{member.type}</div>
        </div>
      ))}
    </div>
  );
}
