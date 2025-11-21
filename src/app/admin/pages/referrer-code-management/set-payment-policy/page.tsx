'use client';

import React, { useState, useEffect } from 'react';
import styles from './SetPolicy.module.css';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ReferralPolicyService } from '@/app/api/services/admin/referralPolicyService/referralPolicyService';
import { ReferralPolicy } from '@/app/api/services/admin/referralPolicyService/referralPolicy';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

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

  const [policy, setPolicy] = useState<ReferralPolicy | null>(null);
  const [pointsPerMember, setPointsPerMember] = useState<number>(1000);
  const [monthlyLimitPerSeller, setMonthlyLimitPerSeller] =
    useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { toast, showSuccess, showError, hideToast } = useToast();

  /** Fetch current referral policy */
  useEffect(() => {
    const fetchPolicy = async (): Promise<void> => {
      setInitializing(true);
      try {
        const { data, error } = await ReferralPolicyService.getAllPolicies();

        if (error || !data?.success || !data.data?.length) {
          console.warn('[SetPolicy] No existing policy found.');
          setPolicy(null);
          setPointsPerMember(1000);
          setMonthlyLimitPerSeller(1000);
        } else {
          const existing = data.data[0];
          setPolicy(existing);
          setPointsPerMember(existing.pointsPerMember);
          setMonthlyLimitPerSeller(existing.monthlyLimitPerSeller);
        }
      } catch (err) {
        console.error('[SetPolicy] Failed to fetch policy:', err);
      } finally {
        setInitializing(false);
      }
    };

    void fetchPolicy();
  }, []);

  const handleReset = (): void => {
    setPointsPerMember(policy?.pointsPerMember ?? 1000);
    setMonthlyLimitPerSeller(policy?.monthlyLimitPerSeller ?? 1000);
  };

  const handleSave = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        pointsPerMember,
        monthlyLimitPerSeller,
        isActive: true,
      };

      if (policy?.policyId) {
        const { data, error } = await ReferralPolicyService.updatePolicy(
          policy.policyId,
          payload
        );

        if (error || !data?.success) {
          console.error(
            '[SetPolicy] Failed to update policy:',
            error ?? data?.resultMsg
          );
          showError('정책 저장에 실패했습니다. 다시 시도해주세요.');
        } else {
          showSuccess('정책이 성공적으로 수정되었습니다.');
          setPolicy((prev) =>
            prev
              ? { ...prev, pointsPerMember, monthlyLimitPerSeller }
              : ({ ...payload, policyId: '' } as ReferralPolicy)
          );
        }
      } else {
        const { data, error } = await ReferralPolicyService.createPolicy(
          payload
        );

        if (error || !data?.success) {
          console.error(
            '[SetPolicy] Failed to create policy:',
            error ?? data?.resultMsg
          );
          showError('정책 생성에 실패했습니다.');
        } else {
          showSuccess('새로운 정책이 성공적으로 생성되었습니다.');
          void (async () => {
            const refresh = await ReferralPolicyService.getAllPolicies();
            if (refresh.data?.data?.[0]) setPolicy(refresh.data.data[0]);
          })();
        }
      }
    } catch (err) {
      console.error('[SetPolicy] Unexpected error:', err);
      showError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

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

      {/* === Header Section === */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>지급 정책 설정</div>
        <div className={styles.sectionDesc}>
          가입자(구매자)가 판매자 추천코드로 가입 시 자동 지급되는 포인트를
          관리합니다.
        </div>
      </div>

      {/* === Policy Form === */}
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

        {/* === Actions === */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={loading}
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

      {/* === Existing Policy Info === */}
      {policy && (
        <div className={styles.policyInfo}>
          <p>
            <strong>정책 ID:</strong> {policy.policyId}
          </p>
          <p>
            <strong>생성일:</strong>{' '}
            {new Date(policy.createdAt ?? '').toLocaleString()}
          </p>
          <p>
            <strong>상태:</strong> {policy.isActive ? '활성화됨' : '비활성화됨'}
          </p>
        </div>
      )}

      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  );
}
