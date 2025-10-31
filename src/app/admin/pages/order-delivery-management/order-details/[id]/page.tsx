'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/ui/modal/Modal';
import styles from './styles.module.css';

type OrderDetails = {
  id: string;
  orderedAt: string;
  buyer: string;
  contact: string;
  address: string;
  product: {
    name: string;
    vendor: string;
    price: number;
    qty: number;
    location: string;
    deliveryMethod: string;
    imageUrl?: string;
    orderItemId: string;
  };
  shipping: {
    memo: string;
    courier: string;
    trackingNumber: string;
  };
};

const KRW = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true); // open by default when route loads

  const [details, setDetails] = useState<OrderDetails>({
    id: params.id || '20250401-001',
    orderedAt: '2025-04-01 11:32',
    buyer: '홍길동',
    contact: '010-0000-0000',
    address: '서울특별시 강남구 테헤란로 123, 위너스빌딩 8층',
    product: {
      name: '상품명',
      vendor: '업체명',
      price: 1000,
      qty: 1,
      location: 'A-01',
      deliveryMethod: '배송',
      imageUrl: '',
      orderItemId: 'orderItem-abc123',
    },
    shipping: {
      memo: '문앞에 놓아주세요. 초인종 누르지 말아주세요',
      courier: 'CJ 대한통운',
      trackingNumber: 'CJ / 12345678910',
    },
  });

  const handleClose = () => {
    setOpen(false);
    router.back(); // go back to the list page
  };

  const handleStartShipping = async () => {
    try {
      await fetch(
        `/api/pet-save/orders/items/${details.product.orderItemId}/prepare`,
        {
          method: 'POST',
        }
      );
      alert('배송 처리 시작되었습니다.');
    } catch (e) {
      console.error(e);
      alert('배송 처리 시작에 실패했습니다.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="주문 상세"
      width={780}
      height={930} /* fixed height; internal content scrolls */
    >
      {/* Top header area inside the modal body to match your design */}
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
      <div className={`${styles.section} ${styles.sectionCustomer}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>고객 정보</div>

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
        </div>
      </div>

      <div className={styles.sectionDivider}></div>

      {/* 상품 정보 */}
      <div className={`${styles.section} ${styles.sectionProduct}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>상품 정보</div>

          <div className={styles.productWrap}>
            <div className={styles.productThumb} />
            <div className={styles.productInfoGrid}>
              <div className={styles.productLabel}>상품명</div>
              <div className={styles.productValue}>{details.product.name}</div>

              <div className={styles.productLabel}>업체명</div>
              <div className={styles.productValue}>
                {details.product.vendor}
              </div>

              <div className={styles.productLabel}>가격</div>
              <div className={styles.productValue}>
                {KRW(details.product.price)}
              </div>

              <div className={styles.productLabel}>상품 수량</div>
              <div className={styles.productValue}>{details.product.qty}</div>

              <div className={styles.productLabel}>위치</div>
              <div className={styles.productValue}>
                {details.product.location}
              </div>

              <div className={styles.productLabel}>배송</div>
              <div className={styles.productValue}>
                {details.product.deliveryMethod}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* 배송 정보 */}
      <div className={`${styles.section} ${styles.sectionShipping}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>배송 정보</div>

          <div className={styles.shipRow}>
            <div className={styles.infoLabel}>배송 메모</div>
            <div className={styles.infoValue}>{details.shipping.memo}</div>
          </div>

          <div className={styles.shipRow}>
            <div className={styles.infoLabel}>택배사</div>
            <div className={styles.infoValue}>{details.shipping.courier}</div>
          </div>

          <div className={styles.trackingRow}>
            <div className={styles.infoLabel}>운송장 번호</div>
            <input
              className={styles.input}
              value={details.shipping.trackingNumber}
              onChange={(e) =>
                setDetails((d) => ({
                  ...d,
                  shipping: { ...d.shipping, trackingNumber: e.target.value },
                }))
              }
              aria-label="운송장 번호 입력"
            />
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider}></div>

      {/* Footer Buttons */}
      <div className={styles.footer}>
        <button className={styles.btn} onClick={handleClose}>
          닫기
        </button>
        <button className={styles.btnPrimary} onClick={handleStartShipping}>
          배송 처리 시작
        </button>
      </div>
    </Modal>
  );
}
