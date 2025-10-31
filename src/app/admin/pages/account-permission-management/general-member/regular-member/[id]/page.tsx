'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function MemberDetailPanelPage() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: searchParams.get('name') || '홍길동',
    nickname: searchParams.get('nickname') || '닝닝닝닝',
    email: searchParams.get('email') || 'osdfkald@naver.com',
    phone: searchParams.get('phone') || '010-0000-0000',
    addressLine:
      searchParams.get('addressLine') ||
      '경기도 안양시 동안구 흥안대로427번길 57-2 (평촌동)',
    zipOrDetail: searchParams.get('zipOrDetail') || '121112호 546432동',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Updated Member Info:', formData);
    // TODO: integrate update endpoint here
  };

  return (
    <div className={styles.container}>
      <form className={styles.panel} onSubmit={handleSubmit}>
        {/* Avatar */}
        <div className={styles.avatar}>
          <Image
            src="/images/logo/per-saves.png"
            alt="Avatar"
            fill
            className={styles.thumb}
          />
        </div>

        {/* Form Stack */}
        <div className={styles.stack}>
          {/* 이름 */}
          <div className={styles.row100}>
            <div className={styles.left80}>
              <span className={styles.leftLabel}>이름</span>
            </div>
            <div className={styles.right350}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.value}
              />
            </div>
          </div>

          {/* 닉네임 */}
          <div className={styles.row100}>
            <div className={styles.left80}>
              <span className={styles.leftLabel}>닉네임</span>
            </div>
            <div className={styles.right350}>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className={styles.value}
              />
            </div>
          </div>

          {/* 이메일 */}
          <div className={styles.row100}>
            <div className={styles.left80}>
              <span className={styles.leftLabel}>이메일</span>
            </div>
            <div className={styles.right350}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.value}
              />
            </div>
          </div>

          {/* 휴대폰 번호 */}
          <div className={styles.row100}>
            <div className={styles.left80}>
              <span className={styles.leftLabel}>휴대폰 번호</span>
            </div>
            <div className={styles.right350}>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.value}
              />
            </div>
          </div>

          {/* 주소 + 상세 */}
          <div className={styles.row160}>
            <div className={styles.left140}>
              <span className={styles.leftLabel}>우편 번호</span>
            </div>
            <div className={styles.rightStack}>
              <div className={styles.right500}>
                <input
                  type="text"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleChange}
                  className={styles.value}
                />
              </div>
              <div className={styles.right500}>
                <input
                  type="text"
                  name="zipOrDetail"
                  value={formData.zipOrDetail}
                  onChange={handleChange}
                  className={styles.value}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.btnOutline}>
            삭제
          </button>
          <button type="submit" className={styles.btnPrimary}>
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
