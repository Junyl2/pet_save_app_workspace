"use client";
import { Product } from "@/app/components/types/order";
import styles from "../ExchangePage.module.css";

interface CollectionInfoStepProps {
  product: Product;
}

export function CollectionInfoStep({ product }: CollectionInfoStepProps) {
  return (
    <>
      {product.deliveryType === "pickup" ? (
        // Direct Exchange UI
        <div className={styles.sectionContainer}>
          <h3 className={styles.sectionTitle}>직접교환</h3>

          <div className={styles.directExchangeWarning}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <span className={styles.warningText}>
                픽업 주문 상품은 반드시 주문 매장에서 직접 교환·환불해야 합니다.
              </span>
            </div>

            <ul className={styles.directExchangeList}>
              <li>택배 교환·반품은 불가합니다.</li>
              <li>주문하신 매장의 영수증과 상품을 꼭 지참해 주세요.</li>
              <li>매장 운영 시간 내 방문이 필요합니다.</li>
            </ul>
          </div>
        </div>
      ) : (
        // Courier Exchange UI
        <div className={styles.sectionContainer}>
          <h3 className={styles.sectionTitle}>수거지 정보</h3>

          <p className={styles.sectionSubtitle}>
            CJ대한통운기사님이 이 주소로 방문해요
          </p>

          <div className={styles.addressCard}>
            <div className={styles.recipientName}>팻세이브</div>
            <div className={styles.phoneNumber}>010-1234-5678</div>
            <div className={styles.address}>
              서울특별시 신림동 ○○ 아파트 101동 101호
            </div>
          </div>
        </div>
      )}
    </>
  );
}
