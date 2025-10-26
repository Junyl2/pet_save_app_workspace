'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';
export default function MemberDetailPanelPage() {
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || '홍길동';
  const nickname = searchParams.get('nickname') || '닝닝닝닝';
  const email = searchParams.get('email') || 'osdfkald@naver.com';
  const phone = searchParams.get('phone') || '010-0000-0000';
  const addressLine =
    searchParams.get('addressLine') ||
    '경기도 안양시 동안구 흥안대로427번길 57-2 (평촌동)';
  const zipOrDetail = searchParams.get('zipOrDetail') || '121112호 546432동';

  return (
    <div className={styles.container}>
      <section className={styles.panel}>
        {/* Avatar (Ellipse 160x160) */}
        <div className={styles.avatar}>
          <Image src={'/images/icons'} alt="Avatar" height={160} width={160} />
        </div>

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

          {/* 휴대폰 번호 */}
          <div className={styles.row100}>
            <div className={styles.left80}>
              <span className={styles.leftLabel}>휴대폰 번호</span>
            </div>
            <div className={styles.right350}>
              <span className={styles.value}>{phone}</span>
            </div>
          </div>

          {/* 주소 + 상세 */}
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
          <button type="button" className={styles.btnOutline}>
            삭제
          </button>
          <button type="button" className={styles.btnPrimary}>
            수정
          </button>
        </div>
      </section>
    </div>
  );
}
