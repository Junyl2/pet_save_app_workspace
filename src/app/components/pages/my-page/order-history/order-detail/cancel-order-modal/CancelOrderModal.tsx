'use client';

import { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import styles from './CancelOrderModal.module.css';

interface CancelOrderModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

const cancelReasons = [
  '단순 변심',
  '상품 불량',
  '배송 지연',
  '상품 정보와 다름',
  '다른 상품 주문',
  '기타',
];

export default function CancelOrderModal({
  show,
  onClose,
  onConfirm,
  isSubmitting = false,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  if (!show) return null;

  const handleReasonSelect = (reason: string): void => {
    setSelectedReason(reason);
    if (reason !== '기타') {
      setCustomReason('');
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedReason) return;

    const finalReason =
      selectedReason === '기타' && customReason.trim()
        ? customReason.trim()
        : selectedReason;

    if (!finalReason) {
      return;
    }

    try {
      await onConfirm(finalReason);
      setSubmitted(true);
    } catch (error) {
      // Error is already handled and displayed via toast in handleConfirmCancel
      // Close modal on error so user can see the toast message
      onClose();
    }
  };

  const handleClose = (): void => {
    setSelectedReason('');
    setCustomReason('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {!submitted ? (
          <>
            <div className={styles.headerModal}>
              <button className={styles.closeButton} onClick={handleClose}>
                <IoCloseOutline size={35} color="rgba(0,0,0,0.3)" />
              </button>
              <h2 className={styles.title}>주문 취소</h2>
            </div>

            <label htmlFor="cancel-reasons" className={styles.reportLabel}>
              주문 취소 사유를 선택해주세요
            </label>
            <ul className={styles.optionList}>
              {cancelReasons.map((reason, index) => (
                <li
                  key={index}
                  className={`${styles.option} ${
                    selectedReason === reason ? styles.selected : ''
                  }`}
                  onClick={() => handleReasonSelect(reason)}
                  style={{
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {reason}
                </li>
              ))}
            </ul>

            {selectedReason === '기타' && (
              <div className={styles.customReasonContainer}>
                <textarea
                  className={styles.customReasonInput}
                  placeholder="취소 사유를 입력해주세요"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                />
              </div>
            )}

            <div className={styles.buttonContainer}>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !selectedReason ||
                  (selectedReason === '기타' && !customReason.trim())
                }
              >
                {isSubmitting ? '처리 중...' : '주문 취소하기'}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.confirmationModal}>
            <div className={styles.confirmation}>
              <h2 className={styles.confirmTitle}>취소 완료</h2>
              <p className={styles.confirmMessage}>
                주문 취소가 완료되었습니다.
              </p>
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
