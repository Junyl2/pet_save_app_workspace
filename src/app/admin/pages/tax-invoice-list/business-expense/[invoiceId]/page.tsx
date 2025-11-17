'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Modal from '@/app/components/ui/modal/Modal';
import styles from './page.module.css';
import { invoiceService } from '@/app/api/services/admin/invoiceService/invoiceService';
import { InvoiceDetail } from '@/app/api/services/admin/invoiceService/invoiceTypes';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

const KRW = (n: number): string =>
  new Intl.NumberFormat('ko-KR').format(n) + '원';

export default function TaxInvoiceDetails() {
  const router = useRouter();
  const params = useParams<{ invoiceId: string }>();
  const invoiceId = params?.invoiceId ?? '';
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<InvoiceDetail | null>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();

  useEffect(() => {
    const fetchInvoiceDetails = async (): Promise<void> => {
      if (!invoiceId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await invoiceService.getInvoiceDetails(
          invoiceId
        );

        if (error || !data?.success || !data?.data) {
          console.error(
            'Failed to fetch invoice details:',
            error || data?.resultMsg
          );
          showError('송장 정보를 불러오는데 실패했습니다.');
          setOpen(false);
          router.back();
          return;
        }

        setDetails(data.data);
      } catch (err) {
        console.error('Error fetching invoice details:', err);
        showError('송장 정보를 불러오는데 실패했습니다.');
        setOpen(false);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    void fetchInvoiceDetails();
  }, [invoiceId, router, showError]);

  const handleClose = (): void => {
    setOpen(false);
    router.back();
  };

  const handleIssue = async (): Promise<void> => {
    if (!invoiceId) {
      return;
    }

    try {
      const { data, error } = await invoiceService.issueInvoice(invoiceId);

      if (error || !data?.success) {
        console.error('Failed to issue invoice:', error || data?.resultMsg);
        showError('발행에 실패했습니다.');
        return;
      }

      showSuccess('발행이 완료되었습니다.');
      handleClose();
    } catch (err) {
      console.error(err);
      showError('발행에 실패했습니다.');
    }
  };

  if (loading || !details) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="거래 증빙서류"
        width={780}
        height={760}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          불러오는 중...
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="거래 증빙서류"
      width={780}
      height={760}
    >
      {/* Header */}
      <div className={styles.headerWrap}>
        <div className={styles.headerInner}>
          <div className={styles.headerTitleBlock}>
            <div className={styles.title}>거래 증빙서류</div>
            <div className={styles.orderId}>{details.invoiceId}</div>
          </div>
          <div className={styles.orderedAt}>
            {details.orderDate
              ? new Date(details.orderDate).toLocaleString('ko-KR')
              : '-'}
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* 고객 정보 */}
      <div className={`${styles.section} ${styles.sectionCustomer}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>고객 정보</div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>주문자</div>
            <div className={styles.infoValue}>
              {details.customerName ?? '-'}
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>연락처</div>
            <div className={styles.infoValue}>
              {details.customerPhone ?? '-'}
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>주소</div>
            <div className={styles.infoValue}>
              {details.customerAddress ?? '-'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* 결제 내역 */}
      <div className={`${styles.section} ${styles.sectionPayment}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>결제 내역</div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>수량</div>
            <div className={styles.infoValue}>{details.totalQuantity}개</div>
          </div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>상품</div>
            <div className={styles.infoValue}>
              {details.items.length > 0
                ? details.items.map((item) => item.productName).join(', ')
                : '-'}
            </div>
          </div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>결제금액</div>
            <div className={styles.infoValue}>{KRW(details.netAmount)}</div>
          </div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>총금액</div>
            <div className={styles.infoValue}>{KRW(details.totalAmount)}</div>
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* 지출증빙용(사업자용) */}
      <div className={`${styles.section} ${styles.sectionReceipt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.receiptType}>지출증빙용(사업자용)</div>

          <div className={styles.paymentRow}>
            <div className={styles.infoLabel}>발행번호</div>
            <div className={styles.infoValue}>{details.issueNumber ?? '-'}</div>
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.btn} onClick={handleClose}>
          닫기
        </button>
        {details.status === 'PENDING' && (
          <button className={styles.btnPrimary} onClick={handleIssue}>
            발행 완료
          </button>
        )}
      </div>
      <ToastContainer toast={toast} onClose={hideToast} />
    </Modal>
  );
}
