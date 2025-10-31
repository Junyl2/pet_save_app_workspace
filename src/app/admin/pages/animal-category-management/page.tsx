'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './AnimalCategory.module.css';
import Image from 'next/image';

interface Member {
  id: string;
  image: string;
  type: string;
  situation: string;
}

const members: Member[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `20250401-00${i + 1}`,
  image: `/images/icons/icon.png`,
  type: 'puppy',
  situation: 'hiding',
}));

export default function AdnimalCategoryPage() {
  const router = useRouter();

  const openInvoice = (member: Member) => {
    const query = new URLSearchParams({
      image: member.image,
      type: member.type,
      situation: member.situation,

      addressLine: '경기도 안양시 동안구 흥안대로427번길 57-2 (평촌동)', // default, replace if available
      zipOrDetail: '121112호 546432동', // default, replace if available
    }).toString();

    router.push(
      `/admin/pages/account-permission-management/general-member/regular-member/${member.id}?${query}`
    );
  };

  return (
    <>
      <div className={styles.wrapper}>
        <button>+ 카테고리 추가</button>

        <div className={styles.headerRow}>
          <div className={styles.col}>아이콘 이미지</div>
          <div className={styles.col}>분류</div>
          <div className={styles.col}>상태</div>
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
            aria-label={`${member.type} 거래 증빙서류 열기`}
          >
            <div className={`${styles.col} ${styles.image}`}>
              <Image src={member.image} height={45} width={45} alt="avatar" />
            </div>
            <div className={styles.col}>{member.type}</div>
            <div className={styles.col}>{member.situation}</div>
            <div className={styles.actions}>
              <button className={styles.hideBtn}>숨김 전환</button>
              <button className={styles.editBtn}>수정하기</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
