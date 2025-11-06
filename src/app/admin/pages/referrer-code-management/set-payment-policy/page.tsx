'use client';

import React, { useState } from 'react';
import styles from './SetPolicy.module.css';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ReferralPolicyService } from '@/app/api/services/admin/referralPolicyService/referralPolicyService';

const slugToTabKey = {
  'set-payment-policy': '지급 정책 설정',
  'payment-details': '지급 내역',
};

export default function SetPaymentPolicyPage() {
  const router = useRouter();
  const pathname = usePathname();

  const activeSlug =
    Object.keys(slugToTabKey).find((slug) => pathname.includes(slug)) ||
    'set-payment-policy';

  const [pointsPerMember, setPointsPerMember] = useState<number>(1000);
  const [monthlyLimitPerSeller, setMonthlyLimitPerSeller] =
    useState<number>(1000);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setPointsPerMember(1000);
    setMonthlyLimitPerSeller(1000);
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        pointsPerMember,
        monthlyLimitPerSeller,
      };

      const { data, error } = await ReferralPolicyService.createPolicy(payload);

      if (error || !data?.success) {
        console.error(
          '[SetPolicy] Failed to save policy:',
          error ?? data?.resultMsg
        );
        alert('정책 저장에 실패했습니다. 다시 시도해주세요.');
      } else {
        console.log('[SetPolicy] Policy saved successfully:', data);
        alert('정책이 성공적으로 저장되었습니다.');
      }
    } catch (err) {
      console.error('[SetPolicy] Unexpected error:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.wrap}>
        <h1 className={styles.title}>추천인 코드 관리</h1>

        <nav className={styles.tabRow} aria-label="Order status tabs">
          {Object.entries(slugToTabKey).map(([slug, label]) => (
            <button
              key={slug}
              type="button"
              className={clsx(
                styles.tab,
                activeSlug === slug ? styles.active : styles.inactive
              )}
              onClick={() =>
                router.push(`/admin/pages/referrer-code-management/${slug}`)
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

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
            <input
              type="number"
              value={pointsPerMember}
              onChange={(e) => setPointsPerMember(Number(e.target.value))}
              className={styles.input}
            />
            <span className={styles.unit}>P</span>
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.label}>월 최대 리미트 (판매자별)</label>
          <div className={styles.inputRow}>
            <input
              type="number"
              value={monthlyLimitPerSeller}
              onChange={(e) => setMonthlyLimitPerSeller(Number(e.target.value))}
              className={styles.input}
            />
            <span className={styles.unit}>P</span>
          </div>
        </div>

        {/* === Action Buttons === */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
          >
            초기화
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
