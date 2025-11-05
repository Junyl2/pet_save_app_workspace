'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './CustomerService.module.css';
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

export default function AddProductPage() {
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
      `/admin/pages/animal-category-management/edit-category/${member.id}?${query}`
    );
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>상품 리스트</h1>
      </div>

      <div className={styles.wrapper}>
        {/* Top Bar: Add Button + Search */}
        <div className={styles.topHeader}>
          {/* Left: Add Category */}

          {/* Right: Search Bar */}
          <div className={styles.searchWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="검색어를 입력하세요"
            />
            <button type="button" className={styles.searchBtn}>
              검색
            </button>
          </div>
        </div>

        <div className={styles.headerRow}>
          <div className={styles.col}>번호</div>
          <div className={styles.col}>제목</div>
          <div className={styles.col}>작성일</div>
          <div className={styles.col}>조회수</div>
        </div>

        {members.map((member) => (
          <div key={member.id} className={styles.dataRow}>
            <div className={styles.col}>{member.situation}</div>
            <div className={styles.col}>{member.situation}</div>
            <div className={styles.col}>{member.situation}</div>
            <div className={styles.col}>{member.situation}</div>
          </div>
        ))}
      </div>
    </>
  );
}
