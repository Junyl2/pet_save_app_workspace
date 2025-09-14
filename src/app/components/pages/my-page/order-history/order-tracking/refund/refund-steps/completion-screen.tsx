import styles from "./completion-screen.module.css";

interface CompletionScreenProps {
  isDeliveryOrder: boolean;
  orderId: string;
}

export function CompletionScreen({
  isDeliveryOrder,
  orderId,
}: CompletionScreenProps) {
  return (
    <div className={styles.container}>
      {/* Success Message Section */}
      <div className={styles.successSection}>
        <div className={styles.successIcon}>
          <img
            src="/images/icons/success.png"
            alt="Success"
            className={styles.successImage}
          />
        </div>

        <h1 className={styles.successTitle}>반품 신청이 완료되었습니다</h1>

        {isDeliveryOrder ? (
          <p className={styles.successMessage}>
            반품 신청 후 <span className={styles.highlight}>2~3일 이내</span>{" "}
            수거가 진행됩니다.
          </p>
        ) : (
          <p className={styles.successMessage}>
            반품 신청 후 <span className={styles.highlight}>7일 이내</span>에
            매장에 방문하여 주세요.
          </p>
        )}
      </div>

      {/* Order Number Section */}
      <div className={styles.orderNumberSection}>
        <p className={styles.orderNumber}>주문번호 {orderId}</p>
      </div>

      {/* Order Details Section */}
      <div className={styles.orderDetailsSection}>
        <div className={styles.orderDetails}>
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>반품 상품</span>
            <span className={styles.orderValue}>총 1건</span>
          </div>

          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>환불 금액</span>
            <span className={styles.orderValue}>21,000원</span>
          </div>

          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>환불 계좌</span>
            <span className={styles.orderValue}>토스페이먼츠 간편결제</span>
          </div>
        </div>
      </div>
    </div>
  );
}
