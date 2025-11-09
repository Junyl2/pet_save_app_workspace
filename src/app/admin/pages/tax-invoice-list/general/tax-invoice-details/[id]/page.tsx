'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Modal from '@/app/components/ui/modal/Modal';
import styles from './page.module.css';

type OrderDetails = {
  id: string;
  orderedAt: string;
  buyer: string;
  contact: string;
  address: string;
  payment: {
    qty: number;
    productName: string;
    amount: number; // 결제금액
    total: number; // 총금액
  };
  receipt: {
    type: string; // 소득공제용(일반개인용)
    issueNumber: string; // 발행번호
  };
};

const KRW = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

export default function TaxInvoceDetails() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const invoiceId = params?.id as string;
  const [open, setOpen] = useState(true);

  const [details] = useState<OrderDetails>({
    id: invoiceId || '20250401-001',
    orderedAt: '2025-04-01 11:32',
    buyer: '홍길동',
    contact: '010-0000-0000',
    address: '서울특별시 강남구 테헤란로 123, 위너스빌딩 8층',
    payment: {
      qty: 1,
      productName: '강아지 사료',
      amount: 50000,
      total: 50000,
    },
    receipt: {
      type: '소득공제용(일반개인용)',
      issueNumber: '010-0000-0000',
    },
  });

  const handleClose = () => {
    setOpen(false);
    router.back();
  };

  const handleIssue = async () => {
    try {
      // (Optional) Call your issue endpoint here
      // await fetch(`/api/pet-save/orders/${details.id}/issue`, { method: 'POST' });
      alert('발행이 완료되었습니다.');
      handleClose();
    } catch (e) {
      console.error(e);
      alert('발행에 실패했습니다.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="거래 증빙서류"
      width={780}
      height={760} /* content fits without the image section */
    >
      {/* Top header area */}
      <div className={styles.headerWrap}>
        <div className={styles.headerInner}>
          <div className={styles.headerTitleBlock}>
            <div className={styles.title}>거래 증빙서류</div>
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

      {/* 결제 내역 */}
      <div className={`${styles.section} ${styles.sectionPayment}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>결제 내역</div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>수량</div>
            <div className={styles.infoValue}>{details.payment.qty}개</div>
          </div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>상품</div>
            <div className={styles.infoValue}>
              {details.payment.productName}
            </div>
          </div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>결제금액</div>
            <div className={styles.infoValue}>
              {KRW(details.payment.amount)}
            </div>
          </div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>총금액</div>
            <div className={styles.infoValue}>{KRW(details.payment.total)}</div>
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider}></div>

      {/* 소득공제용 정보 */}
      <div className={`${styles.section} ${styles.sectionReceipt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.receiptType}>{details.receipt.type}</div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>발행번호</div>
            <div className={styles.infoValue}>
              {details.receipt.issueNumber}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider}></div>

      {/* Footer Buttons */}
      <div className={styles.footer}>
        <button className={styles.btn} onClick={handleClose}>
          닫기
        </button>
        <button className={styles.btnPrimary} onClick={handleIssue}>
          발행 완료
        </button>
      </div>
    </Modal>
  );
}
