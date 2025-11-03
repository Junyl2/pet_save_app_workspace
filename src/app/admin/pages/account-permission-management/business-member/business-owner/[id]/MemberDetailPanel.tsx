'use client';

import React from 'react';
import styles from './page.module.css';

interface MemberDetailPanelProps {
  name?: string; // 이름
  nickname?: string; // 닉네임
  email?: string; // 이메일
  phone?: string; // 휴대폰 번호
  addressLine?: string; // 경기도 안양시 ...
  zipOrDetail?: string; // 121112호 546432동
  onEdit?: () => void; // 수정
  onDelete?: () => void; // 삭제
}

export default function MemberDetailPanel({
  name = '홍길동',
  nickname = '닝닝닝닝',
  email = 'osdfkald@naver.com',
  phone = '010-0000-0000',
  addressLine = '경기도 안양시 동안구 흥안대로427번길 57-2 (평촌동)',
  zipOrDetail = '121112호 546432동',
  onEdit,
  onDelete,
}: MemberDetailPanelProps) {
  return (
    <section className={styles.panel}>
      {/* Avatar */}
      <div className={styles.avatar} aria-hidden />

      {/* Info Stack */}
      <div className={styles.stack}>
        {[
          ['이름', name],
          ['닉네임', nickname],
          ['이메일', email],
          ['휴대폰 번호', phone],
        ].map(([label, value]) => (
          <div className={styles.row100} key={label}>
            <div className={styles.left80}>
              <span className={styles.leftLabel}>{label}</span>
            </div>
            <div className={styles.right350}>
              <span className={styles.value}>{value}</span>
            </div>
          </div>
        ))}

        {/* 주소 */}
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

      {/* Actions */}
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
