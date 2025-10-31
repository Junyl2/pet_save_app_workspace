'use client';
import React from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

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
  type: '사업자',
}));

export default function BusinessMemberPage() {
  const router = useRouter();

  const openInvoice = (id: string) => {
    // adjust the path to match your folder (e.g. /admin/pages/tax-invoice/[id])
    router.push(
      `/admin/pages/tax-invoice-list/general-member/tax-invoice-details/${id}`
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

      {members.map((member, idx) => (
        <div
          key={idx}
          className={styles.dataRow}
          onClick={() => openInvoice(member.id)}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && openInvoice(member.id)
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
