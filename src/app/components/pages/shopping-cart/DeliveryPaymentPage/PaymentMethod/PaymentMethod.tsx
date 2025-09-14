import React from 'react';
import styles from '../DeliveryPayment.module.css';
/* import { useState } from 'react'; */

interface PaymentMethodProps {
  payCategory: 'quick' | 'card' | 'bank' | null;
  setPayCategory: (val: 'quick' | 'card' | 'bank' | null) => void;
  quickBrand: 'toss' | 'kakao' | 'naver' | null;
  setQuickBrand: (val: 'toss' | 'kakao' | 'naver' | null) => void;
}

export default function PaymentMethod({
  payCategory,
  setPayCategory,
  quickBrand,
  setQuickBrand,
}: PaymentMethodProps) {
  return (
    <section className={styles.card}>
      <h3 className={styles.sectionTitle}>결제 수단</h3>
      <div className={styles.payCategory}>
        <label className={styles.checkRow}>
          <input
            type="radio"
            name="payCategory"
            checked={payCategory === 'quick'}
            onChange={() => setPayCategory('quick')}
          />
          <span>간편결제</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="radio"
            name="payCategory"
            checked={payCategory === 'card'}
            onChange={() => setPayCategory('card')}
          />
          <span>신용/체크카드</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="radio"
            name="payCategory"
            checked={payCategory === 'bank'}
            onChange={() => setPayCategory('bank')}
          />
          <span>무통장입금</span>
        </label>
      </div>

      {payCategory === 'quick' && (
        <div className={styles.quickPayments}>
          <button
            type="button"
            className={`${styles.quickBtn} ${
              quickBrand === 'toss' ? styles.quickSelected : ''
            }`}
            onClick={() => setQuickBrand('toss')}
            aria-pressed={quickBrand === 'toss'}
          >
            <span className={styles.tossLogo} /> payments
          </button>
          <button
            type="button"
            className={`${styles.quickBtn} ${styles.kakao} ${
              quickBrand === 'kakao' ? styles.quickSelected : ''
            }`}
            onClick={() => setQuickBrand('kakao')}
            aria-pressed={quickBrand === 'kakao'}
          >
            <span className={styles.kakaoBubble} /> pay
          </button>
          <button
            type="button"
            className={`${styles.quickBtn} ${
              quickBrand === 'naver' ? styles.quickSelected : ''
            }`}
            onClick={() => setQuickBrand('naver')}
            aria-pressed={quickBrand === 'naver'}
          >
            <span className={styles.nBadge}>N</span> pay
          </button>
        </div>
      )}
    </section>
  );
}
