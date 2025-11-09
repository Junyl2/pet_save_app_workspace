'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Modal from '@/app/components/ui/modal/Modal';
import styles from './styles.module.css';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { orderStatusService } from '@/app/api/services/admin/orderStatusService/orderStatusService';
import {
  AdminSearchOrdersResponse,
  AdminSearchOrdersData,
} from '@/app/api/types/member/order/order';

type FulfillmentType = 'DELIVERY' | 'PICKUP';

interface ProductInfo {
  name: string;
  vendor: string;
  price: number;
  qty: number;
  deliveryMethod: string;
  imageUrl?: string;
  orderItemId: string;
}

interface ShippingInfo {
  courier: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
}

interface OrderDetails {
  id: string;
  orderedAt: string;
  buyer: string;
  contact: string;
  address: string;
  fulfillmentType: FulfillmentType;
  product: ProductInfo;
  shipping?: ShippingInfo;
}

const formatKRW = (n: number): string =>
  `${new Intl.NumberFormat('ko-KR').format(n)}원`;

export default function OrderDetailsPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id as string;
  const [open, setOpen] = useState(true);
  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  /** Reset tracking number when new order opens */
  useEffect(() => {
    setTrackingNumber('');
  }, [orderId]);

  /** Fetch order details via /v2/orders */
  useEffect(() => {
    const fetchOrderDetails = async (): Promise<void> => {
      setLoading(true);
      try {
        const { data, error } = await orderService.searchOrdersV2({
          orderNumber: orderId,
          size: 10,
        });

        if (error || !data?.success) {
          console.error('[OrderDetailsPage] Fetch failed:', error);
          setLoading(false);
          return;
        }

        const result = data as AdminSearchOrdersResponse;
        const orderItem = result.data?.content?.find(
          (i) => i.orderNumber === orderId
        );
        if (!orderItem) {
          setLoading(false);
          return;
        }

        const { customer, delivery } = orderItem;
        const mapped: OrderDetails = {
          id: orderItem.orderNumber,
          orderedAt: new Date(orderItem.createdAt).toLocaleString(),
          buyer: customer?.name ?? '-',
          contact: customer?.phone ?? '-',
          address: customer?.address ?? '-',
          fulfillmentType: orderItem.shippingOption,
          product: {
            name: orderItem.productName,
            vendor: orderItem.storeName ?? '-',
            price: orderItem.price,
            qty: orderItem.quantity,
            deliveryMethod:
              orderItem.shippingOption === 'DELIVERY' ? '배송' : '픽업',
            imageUrl: orderItem.productImageUrl,
            orderItemId: orderItem.orderItemId,
          },
          shipping:
            orderItem.shippingOption === 'DELIVERY' && delivery
              ? {
                  courier: delivery.courierName ?? '-',
                  receiverName: delivery.receiverName ?? '-',
                  receiverPhone: delivery.receiverPhone ?? '-',
                  receiverAddress: delivery.receiverAddress ?? '-',
                }
              : undefined,
        };

        setDetails(mapped);
      } catch (err) {
        console.error('[OrderDetailsPage] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      void fetchOrderDetails();
    }
  }, [orderId]);

  const handleClose = (): void => {
    setOpen(false);
    router.back();
  };

  /** 배송/픽업 시작 POST */
  const handleFulfillmentStart = async (): Promise<void> => {
    if (!details) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const orderItemId = details.product.orderItemId;

      if (details.fulfillmentType === 'DELIVERY') {
        if (!trackingNumber.trim()) {
          setErrorMsg('운송장 번호를 입력하세요.');
          setSubmitting(false);
          return;
        }

        const { data, error } = await orderStatusService.beginDelivery(
          orderItemId,
          trackingNumber.trim()
        );

        if (error || !data?.success) {
          const msg = data?.resultMsg?.includes('이미 할당되어')
            ? '이미 등록된 운송장 번호입니다. 다른 번호를 입력하세요.'
            : data?.resultMsg ?? '배송 시작 중 오류가 발생했습니다.';
          setErrorMsg(msg);
          setSubmitting(false);
          return;
        }
      } else {
        const { data, error } = await orderStatusService.beginPickup(
          orderItemId
        );
        if (error || !data?.success) {
          setErrorMsg(data?.resultMsg ?? '픽업 시작 중 오류가 발생했습니다.');
          setSubmitting(false);
          return;
        }
      }

      // 성공 시 input 초기화 및 모달 닫기
      setTrackingNumber('');
      setSubmitting(false);
      setTimeout(() => handleClose(), 800);
    } catch (err) {
      console.error('[OrderDetailsPage] Fulfillment start error:', err);
      setErrorMsg('처리 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  if (loading || !details) {
    return (
      <Modal open={open} onClose={handleClose} title="주문 상세" width={780}>
        <div className={styles.loading}>불러오는 중...</div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`주문 상세 – ${
        details.fulfillmentType === 'DELIVERY' ? '배송' : '픽업'
      }`}
      width={780}
      height={900}
    >
      <div className={styles.headerWrap}>
        <div className={styles.headerInner}>
          <div className={styles.headerTitleBlock}>
            <div className={styles.title}>주문 상세</div>
            <div className={styles.orderId}>{details.id}</div>
          </div>
          <div className={styles.orderedAt}>{details.orderedAt}</div>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* 고객 정보 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>고객 정보</h2>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>주문자</div>
          <div className={styles.infoValue}>{details.buyer}</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>연락처</div>
          <div className={styles.infoValue}>{details.contact}</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>주소</div>
          <div className={styles.infoValue}>{details.address}</div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* 상품 정보 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>상품 정보</h2>
        <div className={styles.productWrap}>
          <div className={styles.productThumb}>
            {details.product.imageUrl && (
              <Image
                src={details.product.imageUrl}
                alt={details.product.name}
                fill
                className={styles.thumb}
              />
            )}
          </div>
          <div className={styles.productInfoGrid}>
            <div className={styles.productLabel}>상품명</div>
            <div className={styles.productValue}>{details.product.name}</div>

            <div className={styles.productLabel}>업체명</div>
            <div className={styles.productValue}>{details.product.vendor}</div>

            <div className={styles.productLabel}>가격</div>
            <div className={styles.productValue}>
              {formatKRW(details.product.price)}
            </div>

            <div className={styles.productLabel}>수량</div>
            <div className={styles.productValue}>{details.product.qty}</div>

            <div className={styles.productLabel}>수령 방식</div>
            <div className={styles.productValue}>
              {details.product.deliveryMethod}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* 배송 입력 */}
      {details.fulfillmentType === 'DELIVERY' && details.shipping && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>배송 정보</h2>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>택배사</div>
            <div className={styles.infoValue}>{details.shipping.courier}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>운송장 번호</div>
            <input
              className={styles.input}
              placeholder="운송장 번호 입력"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          {errorMsg && (
            <p className={styles.errorText} role="alert">
              {errorMsg}
            </p>
          )}
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>수령자</div>
            <div className={styles.infoValue}>
              {details.shipping.receiverName}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>연락처</div>
            <div className={styles.infoValue}>
              {details.shipping.receiverPhone}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>배송 주소</div>
            <div className={styles.infoValue}>
              {details.shipping.receiverAddress}
            </div>
          </div>
        </section>
      )}

      <div className={styles.sectionDivider} />

      {/* Footer */}
      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.btn}
          onClick={handleClose}
          disabled={submitting}
        >
          닫기
        </button>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleFulfillmentStart}
          disabled={submitting}
        >
          {submitting
            ? '처리 중...'
            : details.fulfillmentType === 'DELIVERY'
            ? '배송 처리 시작'
            : '픽업 처리 시작'}
        </button>
      </footer>
    </Modal>
  );
}
