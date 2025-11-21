'use client';

import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { returnExchangeService } from '@/app/api/services/client/return-exchange/returnExchangeService';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
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
  returnRequestId?: string;
  exchangeOption: string;
}

interface ReturnExchangeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: ReturnRequestItem | null;
  onStatusUpdate: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

export const ReturnExchangeDrawer: React.FC<ReturnExchangeDrawerProps> = ({
  isOpen,
  onClose,
  requestData,
  onStatusUpdate,
}) => {
  const [toast, setToast] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !requestData) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleStatusChange = async (status: 'APPROVED' | 'REJECTED') => {
    if (!requestData.returnRequestId) return;

    try {
      await returnExchangeService.updateStatus(requestData.returnRequestId, {
        status,
        ...(status === 'REJECTED' ? { rejectReason } : {}),
      });

      setToast(status === 'APPROVED' ? '승인 완료' : '반려 완료');
      onStatusUpdate(requestData.returnRequestId, status);
      onClose();
    } catch {
      setToast('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const product = requestData.items?.[0]?.product;
  const productPrice = (
    product?.discountedPrice ??
    product?.salePrice ??
    0
  ).toLocaleString('ko-KR');

  const getTypeClass = () =>
    requestData.type === 'RETURN' ? styles.typeRed : styles.typeViolet;

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
          {/* 실제 교환 옵션 표시 */}
          {requestData.type === 'EXCHANGE' && (
            <p className={styles.text}>
              옵션: {requestData.exchangeOption || '없음'}
            </p>
          )}

          <p className={styles.text}>
            구매자: {requestData.requester?.name || '알 수 없음'}
          </p>
          <p className={styles.text}>상품금액: {productPrice}원</p>

          <p className={styles.method}>
            교환 방식: {requestData.collectionMethod || '미지정'}
          </p>
        </div>

        {/* 요청 사유 */}
        <div className={styles.reasonSection}>
          <p className={styles.label}>요청 사유</p>
          <div className={styles.reasonBox}>
            {requestData.reason || '사유가 없습니다.'}
          </div>
        </div>

        {/* 반려 사유 (NEW FIELD) */}
        <div className={styles.reasonSection}>
          <p className={styles.label}>반려사유</p>
          <textarea
            className={styles.reasonBox}
            placeholder="반품 반려 사유를 입력해주세요."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{
              minHeight: '70px',
              resize: 'none',
            }}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.approveBtn}
            onClick={() => handleStatusChange('APPROVED')}
          >
            승인
          </button>

          <button
            type="button"
            className={styles.rejectBtn}
            disabled={rejectReason.trim().length === 0}
            onClick={() => handleStatusChange('REJECTED')}
          >
            반려
          </button>
        </div>

        {toast && (
          <ToastMessage message={toast} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  );
};

export default ReturnExchangeDrawer;
