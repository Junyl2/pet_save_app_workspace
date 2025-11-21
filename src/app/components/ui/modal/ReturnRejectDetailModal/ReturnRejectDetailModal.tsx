'use client';

import React, { useEffect, useState } from 'react';
import styles from './ReturnRejectDetailModal.module.css';
import { returnExchangeService } from '@/app/api/services/client/return-exchange/returnExchangeService';
import { ReturnRequestByOrderItemResponse } from '@/app/api/types/member/return-exchange/returnExchange';

interface RejectReasonModalProps {
  open: boolean;
  orderItemId: string;
  onClose: () => void;
}

export default function RejectReasonModal({
  open,
  orderItemId,
  onClose,
}: RejectReasonModalProps) {
  const [data, setData] = useState<ReturnRequestByOrderItemResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const isReturn = data?.type === 'RETURN';
  const badgeLabel = isReturn ? '반품 반려' : '교환 반려';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open || !orderItemId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await returnExchangeService.getByOrderItemId(orderItemId);

        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, orderItemId]);

  // ❗ Must come AFTER the scroll-lock effect
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {loading || !data ? (
          <p className={styles.loading}>불러오는 중...</p>
        ) : (
          <>
            {/* Top Header */}
            <div className={styles.header}>
              <div className={styles.orderNumberRow}>
                <span className={styles.label}>주문 번호</span>
                <span className={styles.value}>{data.orderNumber}</span>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                ✕
              </button>
            </div>

            {/* Product Info */}
            <div className={styles.productSection}>
              <div
                className={`${styles.badge} ${
                  isReturn ? styles.returnBadge : styles.exchangeBadge
                }`}
              >
                {badgeLabel}
              </div>

              <p className={styles.productName}>
                {data.items[0].product.productName}
              </p>
              <p className={styles.option}>
                {isReturn
                  ? `옵션: ${data.items[0].orderedQuantity}개`
                  : `교환 옵션: ${data.exchangeOption || '옵션 정보 없음'}`}
              </p>
              <p className={styles.buyer}>구매자: {data.requester.name}</p>
              <p className={styles.price}>
                상품금액: {data.items[0].totalAmount.toLocaleString()}원
              </p>
              <p className={styles.method}>
                {isReturn
                  ? `반품 방식: ${
                      data.collectionMethod === 'CUSTOMER_RETURN'
                        ? '직접 방문'
                        : '수거요청'
                    }`
                  : `교환 방식: ${
                      data.collectionMethod === 'CUSTOMER_RETURN'
                        ? '직접 방문'
                        : '수거요청'
                    }`}
              </p>
            </div>

            {/* Request Reason */}
            <div className={styles.section}>
              <p className={styles.fieldTitle}>요청 사유</p>
              <div className={styles.reasonBox}>
                {data.reason?.trim()
                  ? data.reason
                  : '요청 사유가 제공되지 않았습니다.'}
              </div>
            </div>

            {/* Reject Reason */}
            <div className={styles.section}>
              <p className={styles.fieldTitle}>반려사유</p>
              <div className={styles.rejectBox}>
                {data.rejectReason?.trim()
                  ? data.rejectReason
                  : '반려 사유가 입력되지 않았습니다.'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
