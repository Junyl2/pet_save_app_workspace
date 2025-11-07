'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/ui/modal/Modal';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import styles from './styles.module.css';
import Image from 'next/image';

type FulfillmentType = 'DELIVERY' | 'PICKUP';

interface ProductInfo {
  name: string;
  vendor: string;
  price: number;
  qty: number;
  location: string;
  deliveryMethod: string;
  imageUrl?: string;
  orderItemId: string;
}

interface ShippingInfo {
  memo: string | null;
  courier: string;
  trackingNumber: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
}

interface PickupInfo {
  recipientName: string;
  contact: string;
  storeName: string;
  storeAddress: string;
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
  pickup?: PickupInfo;
}

const formatKRW = (n: number): string =>
  `${new Intl.NumberFormat('ko-KR').format(n)}원`;

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch from new v2 endpoint using orderNumber param */
  useEffect(() => {
    const fetchOrderDetails = async (): Promise<void> => {
      setLoading(true);
      try {
        const { data, error } = await orderService.searchOrdersV2({
          orderNumber: params.id,
          size: 10,
        });

        if (error || !data?.success || !data.data.content.length) {
          console.error('Failed to fetch order details:', error);
          setLoading(false);
          return;
        }

        // Pick first matching order item
        const order = data.data.content[0];
        const customer = order.customer ?? {};
        const delivery = order.delivery;

        const mapped: OrderDetails = {
          id: order.orderNumber,
          orderedAt: new Date(order.createdAt).toLocaleString(),
          buyer: customer.name ?? '-',
          contact: customer.phone ?? '-',
          address: customer.address ?? '-',
          fulfillmentType: order.shippingOption as FulfillmentType,
          product: {
            name: order.productName,
            vendor: order.storeName ?? '-',
            price: order.price,
            qty: order.quantity,
            location: '-',
            deliveryMethod:
              order.shippingOption === 'DELIVERY' ? '배송' : '픽업',
            imageUrl: order.productImageUrl,
            orderItemId: order.orderItemId,
          },
          shipping:
            order.shippingOption === 'DELIVERY' && delivery
              ? {
                  memo: delivery.deliveryNotes ?? null,
                  courier: delivery.courierName ?? '-',
                  trackingNumber: delivery.trackingNumber,
                  receiverName: delivery.receiverName ?? '-',
                  receiverPhone: delivery.receiverPhone ?? '-',
                  receiverAddress: delivery.receiverAddress ?? '-',
                }
              : undefined,
          pickup:
            order.shippingOption === 'PICKUP'
              ? {
                  recipientName: customer.name ?? '-',
                  contact: customer.phone ?? '-',
                  storeName: order.storeName ?? '-',
                  storeAddress: order.storeAddress ?? '-',
                }
              : undefined,
        };

        setDetails(mapped);
      } catch (err) {
        console.error('Fetch order error:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrderDetails();
  }, [params.id]);

  const handleClose = (): void => {
    setOpen(false);
    router.back();
  };

  const handleFulfillmentStart = async (): Promise<void> => {
    if (!details) return;
    const endpoint =
      details.fulfillmentType === 'DELIVERY'
        ? `/api/pet-save/orders/items/${details.product.orderItemId}/prepare`
        : `/api/pet-save/orders/items/${details.product.orderItemId}/pickup`;

    try {
      await fetch(endpoint, { method: 'POST' });
      const actionLabel =
        details.fulfillmentType === 'DELIVERY' ? '배송' : '픽업 준비';
      alert(`${actionLabel} 처리가 시작되었습니다.`);
    } catch (e) {
      console.error(e);
      alert('처리 시작에 실패했습니다.');
    }
  };

  if (loading || !details) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="주문 상세"
        width={780}
        height={400}
      >
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
      height={930}
    >
      {/* Header */}
      <div className={styles.headerWrap}>
        <div className={styles.headerInner}>
          <div className={styles.headerTitleBlock}>
            <div className={styles.title}>주문 상세</div>
            <div className={styles.orderId}>{details.id}</div>
          </div>
          <div className={styles.orderedAt}>{details.orderedAt}</div>
        </div>
      </div>

      <div className={styles.sectionDivider}></div>

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

      <div className={styles.sectionDivider}></div>

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

      <div className={styles.sectionDivider}></div>

      {/* Fulfillment Details */}
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
              value={details.shipping.trackingNumber ?? ''}
              onChange={(e) =>
                setDetails((prev) =>
                  prev
                    ? {
                        ...prev,
                        shipping: {
                          ...prev.shipping!,
                          trackingNumber: e.target.value,
                        },
                      }
                    : prev
                )
              }
            />
          </div>
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
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>배송 메모</div>
            <div className={styles.infoValue}>
              {details.shipping.memo ?? '메모 없음'}
            </div>
          </div>
        </section>
      )}

      {details.fulfillmentType === 'PICKUP' && details.pickup && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>픽업 정보</h2>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>수령자명</div>
            <div className={styles.infoValue}>
              {details.pickup.recipientName}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>연락처</div>
            <div className={styles.infoValue}>{details.pickup.contact}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>매장명</div>
            <div className={styles.infoValue}>{details.pickup.storeName}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>매장 주소</div>
            <div className={styles.infoValue}>
              {details.pickup.storeAddress}
            </div>
          </div>
        </section>
      )}

      <div className={styles.sectionDivider}></div>

      {/* Footer */}
      <footer className={styles.footer}>
        <button className={styles.btn} onClick={handleClose}>
          닫기
        </button>
        <button className={styles.btnPrimary} onClick={handleFulfillmentStart}>
          {details.fulfillmentType === 'DELIVERY'
            ? '배송 처리 시작'
            : '픽업 준비 시작'}
        </button>
      </footer>
    </Modal>
  );
}
