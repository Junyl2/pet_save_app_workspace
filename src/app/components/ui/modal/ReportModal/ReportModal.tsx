'use client';
import { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { ProductSummary } from '@/app/api/types/products/productSummary';
import { ReportService } from '@/app/api/services/client/memberService/report/reportService';
import {
  CreateReportRequest,
  ReportTargetType,
  REASON_MAPPING,
} from '@/app/api/types/member/report/report';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

import styles from './ReportModal.module.css';

interface ReportModalProps {
  show: boolean;
  onClose: () => void;
  product?: ProductSummary;
  storeId?: string;
  storeName?: string;
}

const reportOptions = [
  '허위 광고',
  '안전 문제',
  '불법 제품',
  '부적절한 판매자',
  '불쾌하거나 부적절한 내용',
  '동물학대 관련 상품',
];

export default function ReportModal({
  show,
  onClose,
  product,
  storeId,
}: ReportModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();

  if (!show) return null;

  const handleOptionClick = async (option: string) => {
    let targetType: ReportTargetType;
    let targetId: string;

    // Identify target
    if (pathname.includes('/products/') && product) {
      targetType = 'PRODUCT';
      targetId = product.productId;
    } else if (pathname.includes('/seller-details/') && storeId) {
      targetType = 'STORE';
      targetId = storeId;
    } else if (product) {
      targetType = 'PRODUCT';
      targetId = product.productId;
    } else {
      toast.error('신고할 대상을 찾을 수 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reasonCode = REASON_MAPPING[option] || option;

      const reportData: CreateReportRequest = {
        targetType,
        targetId,
        reason: reasonCode,
        description: option,
      };

      const response = await ReportService.createReport(reportData);

      // If backend returns error field
      if (response.error) {
        const lower = response.error.toLowerCase();

        if (
          lower.includes('409') ||
          lower.includes('이미 해당 대상을 신고하셨습니다')
        ) {
          toast.error('이미 신고한 대상입니다.');
        } else {
          toast.error('신고 제출에 실패했습니다.');
        }

        onClose();
        return;
      }

      setSubmitted(true);
    } catch (error: unknown) {
      // Network or unexpected errors
      toast.error('신고 제출 중 오류가 발생했습니다.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.headerModal}>
          {!submitted && (
            <>
              <button className={styles.closeButton} onClick={handleClose}>
                <IoCloseOutline size={35} color="rgba(0,0,0,0.3)" />
              </button>
              <h2 className={styles.title}>신고하기</h2>
            </>
          )}
        </div>

        {!submitted ? (
          <>
            <label htmlFor="Report Options" className={styles.reportLabel}>
              이 게시물을 신고하는 이유
            </label>
            <ul className={styles.optionList}>
              {reportOptions.map((option, index) => (
                <li
                  key={index}
                  className={styles.option}
                  onClick={() => !isSubmitting && handleOptionClick(option)}
                  style={{
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? '제출 중...' : option}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className={styles.confirmationModal}>
            <div className={styles.confirmation}>
              <h2 className={styles.confirmTitle}>신고 완료</h2>
              <p className={styles.confirmMessage}>신고가 완료되었습니다.</p>
              <button className={styles.confirmButton} onClick={handleClose}>
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
