'use client';

import React from 'react';
import styles from './page.module.css';

type Props = {
  name?: string; // 이름
  nickname?: string; // 닉네임
  email?: string; // 이메일
  phone?: string; // 휴대폰 번호
  addressLine?: string; // 경기도 안양시 ...
  zipOrDetail?: string; // 121112호 546432동
  onEdit?: () => void; // 수정
  onDelete?: () => void; // 삭제
};

export default function MemberDetailPanel({
  name = '홍길동',
  nickname = '닝닝닝닝',
  email = 'osdfkald@naver.com',
  phone = '010-0000-0000',
  addressLine = '경기도 안양시 동안구 흥안대로427번길 57-2 (평촌동)',
  zipOrDetail = '121112호 546432동',
  onEdit,
  onDelete,
}: Props) {
  return (
    <section className={styles.panel}>
      {/* Avatar (Ellipse 160x160) */}
      <div className={styles.avatar} aria-hidden />

      {/* Frame 619 – vertical stack of rows */}
      <div className={styles.stack}>
        {/* 이름 */}
        <div className={styles.row100}>
          <div className={styles.left80}>
            <span className={styles.leftLabel}>이름</span>
          </div>
          <div className={styles.right350}>
            <span className={styles.value}>{name}</span>
          </div>
        </div>

        {/* 닉네임 */}
        <div className={styles.row100}>
          <div className={styles.left80}>
            <span className={styles.leftLabel}>닉네임</span>
          </div>
          <div className={styles.right350}>
            <span className={styles.value}>{nickname}</span>
          </div>
        </div>

        {/* 이메일 */}
        <div className={styles.row100}>
          <div className={styles.left80}>
            <span className={styles.leftLabel}>이메일</span>
          </div>
          <div className={styles.right350}>
            <span className={styles.value}>{email}</span>
          </div>
        </div>

        {/* 휴대폰 번호 (Group 401) */}
        <div className={styles.row100}>
          <div className={styles.left80}>
            <span className={styles.leftLabel}>휴대폰 번호</span>
          </div>
          <div className={styles.right350}>
            <span className={styles.value}>{phone}</span>
          </div>
        </div>

        {/* 주소 + 상세 (Group 636) */}
        <div className={styles.row160}>
          <div className={styles.left140}>
            <span className={styles.leftLabel}>우편 번호</span>
          </div>
          <div className={styles.rightStack}>
            <div className={styles.right500}>
              <span className={styles.value}>{addressLine}</span>
            </div>
            <div className={styles.right500}>
              <span className={styles.value}>{zipOrDetail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Group 319 – bottom actions (width 710 → two 350 buttons) */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnOutline}
          onClick={onDelete}
          aria-label="삭제"
        >
          삭제
        </button>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={onEdit}
          aria-label="수정"
        >
          수정
        </button>
      </div>
    </section>
  );
}
