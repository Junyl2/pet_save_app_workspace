import styles from '../DeliveryPayment.module.css';

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

      {/* 간편결제 */}
      <div className={styles.quickSection}>
        <label className={styles.checkRow}>
          <input
            type="radio"
            name="payCategory"
            value="quick"
            checked={payCategory === 'quick'}
            onChange={() => setPayCategory('quick')}
            className={styles.checkbox}
          />
          <span>간편결제</span>
        </label>

        {payCategory === 'quick' && (
          <div className={styles.quickPayments}>
            {/* Toss */}
            <button
              type="button"
              className={`${styles.quickBtn1} ${
                quickBrand === 'toss' ? styles.quickSelected : ''
              }`}
              onClick={() => setQuickBrand('toss')}
              aria-pressed={quickBrand === 'toss'}
            ></button>

            {/* Kakao */}
            <button
              type="button"
              className={`${styles.quickBtn2} ${
                quickBrand === 'kakao' ? styles.quickSelected : ''
              }`}
              onClick={() => setQuickBrand('kakao')}
              aria-pressed={quickBrand === 'kakao'}
            ></button>

            {/* Naver */}
            <button
              type="button"
              className={`${styles.quickBtn3} ${
                quickBrand === 'naver' ? styles.quickSelected : ''
              }`}
              onClick={() => setQuickBrand('naver')}
              aria-pressed={quickBrand === 'naver'}
            ></button>
          </div>
        )}
      </div>

      {/* Other payment methods */}
      <div className={styles.payCategoryColumn}>
        <label className={styles.checkRow}>
          <input
            type="radio"
            name="payCategory"
            value="card"
            checked={payCategory === 'card'}
            onChange={() => setPayCategory('card')}
            className={styles.checkbox}
          />
          <span>신용/체크카드</span>
        </label>

        <label className={styles.checkRow}>
          <input
            type="radio"
            name="payCategory"
            value="bank"
            checked={payCategory === 'bank'}
            onChange={() => setPayCategory('bank')}
            className={styles.checkbox}
          />
          <span>무통장입금</span>
        </label>
      </div>
    </section>
  );
}
