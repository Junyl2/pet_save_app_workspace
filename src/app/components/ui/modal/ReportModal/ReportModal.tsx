'use client';
import { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

import styles from './ReportModal.module.css';

interface ReportModalProps {
  show: boolean;
  onClose: () => void;
}

const reportOptions = [
  '허위 광고',
  '안전 문제',
  '불법 제품',
  '부적절한 판매자',
  '불쾌하거나 부적절한 내용',
  '동물학대 관련 상품',
];

export default function ReportModal({ show, onClose }: ReportModalProps) {
  const [submitted, setSubmitted] = useState(false);
  /*   const [selectedOption, setSelectedOption] = useState<string | null>(null); */

  if (!show) return null;

  const handleOptionClick = (option: string) => {
    /* setSelectedOption(option); */
    setSubmitted(true);
    console.log('Selected report reason:', option);
  };

  const handleClose = () => {
    setSubmitted(false);
    /*  setSelectedOption(null); */
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Close button */}
        <div className={styles.headerModal}>
          {!submitted && (
            <>
              <button className={styles.closeButton} onClick={handleClose}>
                <IoCloseOutline size={35} color="rgba(0,0,0,0.3" />
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
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
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
