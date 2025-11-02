'use client';

import React from 'react';
import Image from 'next/image';
import styles from './Edit.module.css';

export default function EditCategoryPage() {
  return (
    <>
      {/* Top Header Section */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>동물 카테고리 관리</h1>
        <h2 className={styles.subTitle}>카테고리 목록</h2>
      </div>

      {/* Main Box */}
      <section className={styles.section}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h4 className={styles.editInfo}>기본 정보 수정</h4>
            <p className={styles.note}>필수 항목 수정 후 저장을 눌러주세요.</p>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {/* Left Image Upload */}
          <div className={styles.imageSection}>
            <h2 className={styles.title}>기본 정보</h2>
            <label className={styles.label}>대표 이미지*</label>
            <div className={styles.imageBox}>
              <Image
                src="/mock-image.jpg" // mock placeholder
                alt="대표 이미지"
                fill
                className={styles.image}
                sizes="217px"
                priority
              />
            </div>
            <div className={styles.imageButtons}>
              <button type="button" className={styles.deleteBtn}>
                삭제
              </button>
              <button type="button" className={styles.selectBtn}>
                파일 선택
              </button>
            </div>
          </div>

          {/* Right Fields */}
          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>카테고리명*</label>
              <input
                type="text"
                className={styles.input}
                defaultValue="강아지"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>영문명 (선택)</label>
              <input type="text" className={styles.input} defaultValue="Dog" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>정렬 순서*</label>
              <input type="number" className={styles.input} defaultValue="1" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Buttons (outside box) */}
      <div className={styles.footerOutside}>
        <button type="button" className={styles.footerBtnWhite}>
          삭제
        </button>
        <button type="button" className={styles.footerBtnGreen}>
          목록
        </button>
        <button type="button" className={styles.footerBtnWhite}>
          저장
        </button>
      </div>
    </>
  );
}
