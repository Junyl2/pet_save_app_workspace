'use client';

import Image from 'next/image';
import { BaseModal } from '../BaseModal';
import styles from './WarningModal.module.css';

interface WarningModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WarningModal({ open, onClose }: WarningModalProps) {
  return (
    <BaseModal open={open} onClose={onClose} title="">
      <div className={styles.container}>
        <Image
          src="/images/icons/warning.svg"
          alt="warning"
          width={52}
          height={52}
          className={styles.icon}
        />

        <h3 className={styles.heading}>이용 제한 경고</h3>

        <p className={styles.text}>
          최근 신고가 접수되었습니다.
          <br />
          유사한 행위가 반복될 경우
          <br />
          서비스 이용이 제한될 수 있습니다.
        </p>

        <button className={styles.button} onClick={onClose}>
          확인
        </button>
      </div>
    </BaseModal>
  );
}
