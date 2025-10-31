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
  status: '승인 대기' | '승인 완료' | '반려';
}

const STATUS_COLORS: Record<Member['status'], string> = {
  '승인 대기': '#E9B430',
  '승인 완료': '#009329',
  반려: '#EA080C',
};

const members: Member[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `20250401-00${i + 1}`,
  name: `홍길동 ${i + 1}`,
  nickname: `닉네임${i + 1}`,
  contact: `010-0000-000${i}`,
  email: `user${i + 1}@mail.com`,
  status: i % 3 === 0 ? '승인 완료' : i % 3 === 1 ? '반려' : '승인 대기', // sample variety
}));

export default function BusinessRegistrationConfirmationPage() {
  const router = useRouter();

  const openInvoice = (member: Member): void => {
    const query = new URLSearchParams({
      name: member.name,
      nickname: member.nickname,
      email: member.email,
      phone: member.contact,
      addressLine: '경기도 안양시 동안구 흥안대로427번길 57-2 (평촌동)',
      zipOrDetail: '121112호 546432동',
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
        <div className={styles.col}>요청상태</div>
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
          aria-label={`${member.name} 정보 보기`}
        >
          <div className={styles.col}>{member.name}</div>
          <div className={styles.col}>{member.nickname}</div>
          <div className={styles.col}>{member.contact}</div>
          <div className={styles.col}>{member.email}</div>
          <div
            className={styles.col}
            style={{ color: STATUS_COLORS[member.status], fontWeight: 600 }}
          >
            {member.status}
          </div>
          <div className={styles.actions}>
            <button className={styles.cancelBtn}>취소</button>
            <button className={styles.approveBtn}>승인</button>
          </div>
        </div>
      ))}
    </div>
  );
}
