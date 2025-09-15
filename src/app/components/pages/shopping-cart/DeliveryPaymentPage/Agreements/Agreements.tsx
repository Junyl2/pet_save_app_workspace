import styles from '../DeliveryPayment.module.css';

interface AgreementsProps {
  agreeOrderInfo: boolean;
  setAgreeOrderInfo: (v: boolean) => void;
  agreePrivacy: boolean;
  setAgreePrivacy: (v: boolean) => void;
  agreeFinal: boolean;
  setAgreeFinal: (v: boolean) => void;
  canPay: boolean;
}

export default function Agreements({}: /*   agreeOrderInfo,
  setAgreeOrderInfo,
  agreePrivacy,
  setAgreePrivacy,
  agreeFinal,
  setAgreeFinal,
  canPay, */
AgreementsProps) {
  return (
    <section className={styles.card}>
      {/* First item */}
      <div className={styles.bulletRow}>
        <span className={styles.bullet}>•</span>
        <span>주문하실 상품 및 결제, 주문정보를 확인하였으며 이에 동의</span>
        {/*
        <input
          type="checkbox"
          checked={agreeOrderInfo}
          onChange={(e) => setAgreeOrderInfo(e.target.checked)}
        />
        */}
      </div>

      {/* Second item with "보기" aligned to end */}
      <div className={`${styles.bulletRow} ${styles.withBorder}`}>
        <div className={styles.flexBetween}>
          <div className={styles.flexStart}>
            <span className={styles.bullet}>•</span>
            <span>개인정보 수집 이용 및 제3자 정보 제공 동의</span>
          </div>
          <button type="button" className={styles.linkBtn}>
            보기
          </button>
          {/*
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
          />
          */}
        </div>
      </div>

      {/* Third item */}
      <div className={styles.bulletRow}>
        <span className={styles.labelAgreements}>
          위 내용을 확인하였으며 결제에 동의합니다.
        </span>
        {/*
        <input
          type="checkbox"
          checked={agreeFinal}
          onChange={(e) => setAgreeFinal(e.target.checked)}
        />
        */}
      </div>

      {/* Warning text */}
      <p className={styles.warnMuted}>
        결제 전 <span className={styles.underlineMuted}>이용약관 및 정보</span>{' '}
        제공 동의를 확인해 주세요.
      </p>
    </section>
  );
}
