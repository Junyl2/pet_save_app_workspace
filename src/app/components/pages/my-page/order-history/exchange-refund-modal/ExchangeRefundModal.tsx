'use client';

import { useState } from 'react';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import { FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { PAGE_URLS } from '@/app/utils/page_url';
import styles from './ExchangeRefundModal.module.css';
import { Product } from '@/app/components/types/order';

interface ExchangeRefundModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (choice: 'exchange' | 'refund') => void;
  orderId: string;
  product: Product;
}

export const ExchangeRefundModal = ({
  open,
  onClose,
  onSelect,
  orderId,
  product,
}: ExchangeRefundModalProps) => {
  const [step, setStep] = useState<'info' | 'choice'>('info');
  const router = useRouter();

  const handleNext = () => setStep('choice');

  /**  Go to exchange page with real order data (UUID) */
  const handleExchangeClick = () => {
    if (!orderId || !product?.orderItemId) return;

    onSelect('exchange');
    setStep('info');
    onClose();

    router.push(
      `${PAGE_URLS.ORDER_EXCHANGE(orderId)}?` +
        `orderItemId=${encodeURIComponent(product.orderItemId)}&` +
        `productId=${product.id}&` +
        `name=${encodeURIComponent(product.name)}&` +
        `price=${product.price}&` +
        `discountPrice=${product.discountPrice ?? ''}&` +
        `brand=${encodeURIComponent(product.brand ?? '')}&` +
        `image=${encodeURIComponent(product.image ?? '')}&` +
        `deliveryType=${product.deliveryType}`
    );
  };

  /** Go to refund page with real order data (UUID) */
  const handleRefundClick = () => {
    if (!orderId || !product?.orderItemId) return;

    onSelect('refund');
    setStep('info');
    onClose();

    router.push(
      `${PAGE_URLS.ORDER_REFUND(orderId)}?` +
        `orderItemId=${encodeURIComponent(product.orderItemId)}&` +
        `productId=${product.id}&` +
        `name=${encodeURIComponent(product.name)}&` +
        `price=${product.price}&` +
        `discountPrice=${product.discountPrice ?? ''}&` +
        `brand=${encodeURIComponent(product.brand ?? '')}&` +
        `image=${encodeURIComponent(product.image ?? '')}&` +
        `deliveryType=${product.deliveryType}`
    );
  };

  return (
    <BaseModal
      open={open}
      onClose={() => {
        onClose();
        setStep('info');
      }}
      withOverlay
      noRadius
      className={styles.container}
    >
      {step === 'info' && (
        <>
          <h2 className={styles.title}>교환/반품 안내사항</h2>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>1. 공통 안내</p>
            <ul className={styles.list}>
              <li>상품 수령 후 7일 이내 교환/반품 신청이 가능합니다.</li>
              <li>
                상품 및 포장 상태가 훼손되지 않아야 교환/반품이 가능합니다.
              </li>
              <li>사용 흔적, 훼손, 세탁된 상품은 교환/반품이 불가합니다.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>2. 배송 주문 시</p>
            <ul className={styles.list}>
              <li>택배를 통해 교환/반품이 진행됩니다.</li>
              <li>택배 수거(회수) 일정은 고객센터 안내에 따릅니다.</li>
              <li>
                왕복 배송비가 발생할 수 있으며, 사유에 따라 고객 부담일 수
                있습니다.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>
              3. 픽업 주문 시 <span className={styles.important}>(중요)</span>
            </p>
            <ul className={styles.list}>
              <li className={styles.warning}>
                <FiAlertTriangle className={styles.icon} />
                픽업 주문 상품은 반드시 매장에서 직접 교환/환불 진행해야 합니다.
              </li>
              <li>택배 교환/반품이 불가합니다.</li>
              <li>주문하신 매장 영수증과 상품을 지참해 주셔야 합니다.</li>
              <li>매장 운영 시간 내 방문해 주시기 바랍니다.</li>
            </ul>
          </div>

          <button className={styles.nextBtn} onClick={handleNext}>
            다음
          </button>
        </>
      )}

      {step === 'choice' && (
        <div className={styles.choiceContainer}>
          <h2 className={styles.title}>교환/반품 선택</h2>
          <div className={styles.choiceButtons}>
            <button
              className={`${styles.choiceBtn} ${styles.outline}`}
              onClick={handleExchangeClick}
            >
              교환
            </button>
            <button
              className={`${styles.choiceBtn} ${styles.filled}`}
              onClick={handleRefundClick}
            >
              반품
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  );
};
