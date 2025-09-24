"use client";
import { Product } from "@/app/components/types/order";

import styles from "./SuccessScreen.module.css";

interface SuccessScreenProps {
  orderId: string;
  product: Product;
  onBack: () => void;
}

export function SuccessScreen({ orderId, product }: SuccessScreenProps) {
  return (
    <div className={styles.container}>
      {/* Success Message Section */}

      <div className={styles.successIcon}>
        <img
          src="/images/icons/success.png"
          alt="Success"
          className={styles.successImage}
        />
      </div>
      <div className={styles.successDetails}>
        <h2 className={styles.successTitle}>교환 신청이 완료되었습니다</h2>

        <p className={styles.successMessage}>
          교환 신청 후 <span className={styles.highlight}>2~3일 이내</span>에
          수거가 진행됩니다.
        </p>
      </div>

      {/* Order Number Section */}
      <div className={styles.orderNumberSection}>
        <p className={styles.orderNumber}>주문번호 {orderId}</p>

        {/* Order Details Section */}

        <div className={styles.orderDetails}>
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>반품 상품</span>
            <span className={styles.orderValue}>총 1건</span>
          </div>

          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>환불 금액</span>
            <span className={styles.orderValue}>
              {product.price.toLocaleString()}원
            </span>
          </div>

          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>환불 계좌</span>
            <span className={styles.orderValue}>토스뱅크카드 간편결제</span>
          </div>
        </div>
      </div>
    </div>
  );
}
