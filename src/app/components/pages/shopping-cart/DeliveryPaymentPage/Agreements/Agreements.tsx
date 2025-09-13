import styles from '../DeliveryPayment.module.css';

interface AgreementsProps {
  agreeOrderInfo: boolean;
  setAgreeOrderInfo: (val: boolean) => void;
  agreePrivacy: boolean;
  setAgreePrivacy: (val: boolean) => void;
  agreeFinal: boolean;
  setAgreeFinal: (val: boolean) => void;
  canPay: boolean;
}

export default function Agreements({
  agreeOrderInfo,
  setAgreeOrderInfo,
  agreePrivacy,
  setAgreePrivacy,
  agreeFinal,
  setAgreeFinal,
  canPay,
}: AgreementsProps) {
  return (
    <section className={styles.card}>
      <label className={styles.checkRow}>
        <input
          type="checkbox"
          checked={agreeOrderInfo}
          onChange={(e) => setAgreeOrderInfo(e.target.checked)}
        />
        <span>주문하실 상품 및 결제, 주문정보를 확인하였으며 이에 동의</span>
      </label>

      <div className={styles.privacyRow}>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
          />
          <span>개인정보 수집 이용 및 제3자 정보 제공 동의</span>
        </label>
        <button type="button" className={styles.linkBtn}>
          보기
        </button>
      </div>

      <label className={styles.checkRow}>
        <input
          type="checkbox"
          checked={agreeFinal}
          onChange={(e) => setAgreeFinal(e.target.checked)}
        />
        <span>위 내용을 확인하였으며 결제에 동의합니다.</span>
      </label>

      {!canPay && (
        <p className={styles.warnText}>
          결제 전 이용약관 및 정보제공 동의를 확인해 주세요.
        </p>
      )}
    </section>
  );
}
