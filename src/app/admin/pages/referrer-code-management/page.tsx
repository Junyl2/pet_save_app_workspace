'use client';

import React from 'react';
import styles from './QrManagement.module.css';

export default function QrManagementPage() {
  return (
    <div className={styles.pageContainer}>
      {/* === Search Area === */}
      <div className={styles.topBar}>
        <div className={styles.searchWrap}>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className={styles.searchInput}
          />
          <button type="button" className={styles.searchBtn}>
            검색
          </button>
        </div>
      </div>

      {/* === Header Section === */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>지급 정책 설정</div>
        <div className={styles.sectionDesc}>
          가입자 (구매자)가 판매자 추천코드로 가입 시 자동 지급되는 포인트를
          관리합니다.
        </div>
      </div>

      {/* === White Box === */}
      <div className={styles.contentBox}>
        <div className={styles.row}>
          <label className={styles.label}>가입 1명당 지급 포인트</label>
          <div className={styles.inputRow}>
            <input type="number" defaultValue={1000} className={styles.input} />
            <span className={styles.unit}>P</span>
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.label}>월 최대 리미트 (판매자별)</label>
          <div className={styles.inputRow}>
            <input type="number" defaultValue={1000} className={styles.input} />
            <span className={styles.unit}>P</span>
          </div>
        </div>

        {/* === Action Buttons === */}
        <div className={styles.actions}>
          <button type="button" className={styles.resetBtn}>
            초기화
          </button>
          <button type="button" className={styles.saveBtn}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
