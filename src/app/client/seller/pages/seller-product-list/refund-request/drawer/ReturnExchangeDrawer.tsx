'use client';

import React from 'react';
import { IoClose } from 'react-icons/io5';
import styles from './ReturnExchangeDrawer.module.css';

interface ProductInfo {
  productName: string;
  productThumbnail: string | null;
  salePrice: number;
  discountedPrice: number;
}

interface ReturnRequestItem {
  orderNumber: string;
  type: string;
  status: string;
  reason: string;
  collectionMethod: string;
  requester: { name: string };
  items: Array<{ product: ProductInfo }>;
}

interface ReturnExchangeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: ReturnRequestItem | null;
}

export const ReturnExchangeDrawer: React.FC<ReturnExchangeDrawerProps> = ({
  isOpen,
  onClose,
  requestData,
}) => {
  if (!isOpen || !requestData) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose();
  };

  const product = requestData.items?.[0]?.product;
  const productPrice = (
    product?.discountedPrice ??
    product?.salePrice ??
    0
  ).toLocaleString('ko-KR');
  const exchangeOption = '옵션: 교환 옵션 (임시 표시)';

  // --- Tag style logic
  const getTypeClass = () => {
    return requestData.type === 'RETURN' ? styles.typeRed : styles.typeViolet;
  };

  const getStatusClass = () => {
    if (requestData.status === 'REQUESTED') return styles.statusGray;
    if (requestData.status === 'APPROVED') return styles.statusGreen;
    if (requestData.status === 'REJECTED') return styles.statusRed;
    return styles.statusGray;
  };

  const getStatusLabel = () => {
    switch (requestData.status) {
      case 'REQUESTED':
        return '대기중';
      case 'APPROVED':
        return '처리완료';
      case 'REJECTED':
        return '반려됨';
      default:
        return requestData.status;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div className={styles.orderInfo}>
            <span className={styles.label}>주문 번호</span>
            <span className={styles.value}>{requestData.orderNumber}</span>
          </div>
          <button
            type="button"
            aria-label="Close Drawer"
            className={styles.closeButton}
            onClick={onClose}
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className={styles.productInfo}>
          <div className={styles.statusRow}>
            <span className={`${styles.tag} ${getTypeClass()}`}>
              {requestData.type === 'RETURN' ? '반품' : '교환'}
            </span>
            <span className={`${styles.tag} ${getStatusClass()}`}>
              {getStatusLabel()}
            </span>
          </div>
          <p className={styles.productName}>
            {product?.productName || '상품명 없음'}
          </p>
          <p className={styles.text}>{exchangeOption}</p>
          <p className={styles.text}>
            구매자: {requestData.requester?.name || '알 수 없음'}
          </p>
          <p className={styles.text}>상품금액: {productPrice}원</p>
          <p className={styles.method}>
            교환 방식: {requestData.collectionMethod || '미지정'}
          </p>
        </div>

        <div className={styles.reasonSection}>
          <p className={styles.label}>요청 사유</p>
          <div className={styles.reasonBox}>
            {requestData.reason || '사유가 없습니다.'}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.approveBtn}>
            승인
          </button>
          <button type="button" className={styles.rejectBtn}>
            반려
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnExchangeDrawer;
