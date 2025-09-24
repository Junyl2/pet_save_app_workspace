import styles from '../DeliveryPayment.module.css';

interface PaymentSummaryProps {
  subtotal: number;
  discountAmount: number;
  usePoints: number;
  shippingFee: number;
  totalDue: number;
}

export default function PaymentSummary({
  subtotal,
  discountAmount,
  usePoints,
  shippingFee,
  totalDue,
}: PaymentSummaryProps) {
  return (
    <section className={styles.card}>
      <h3 className={styles.sectionTitle}>결제 금액</h3>
      <div className={styles.summaryRow}>
        <span className={styles.paymentLabel}>상품 금액</span>
        <span>{subtotal.toLocaleString()}원</span>
      </div>
      <div className={styles.summaryRow}>
        <span className={styles.paymentLabel}>할인 금액</span>
        <span>{discountAmount.toLocaleString()}원</span>
      </div>
      <div className={styles.summaryRow}>
        <span className={styles.paymentLabel}>포인트 사용 금액</span>
        <span>{usePoints.toLocaleString()}원</span>
      </div>
      <div className={styles.summaryRow}>
        <span className={styles.paymentLabel}>배송비</span>
        <span>{shippingFee.toLocaleString()}원</span>
      </div>
      <div className={styles.totalRow}>
        <strong>결제 예정 금액</strong>
        <strong>{totalDue.toLocaleString()}원</strong>
      </div>
    </section>
  );
}
