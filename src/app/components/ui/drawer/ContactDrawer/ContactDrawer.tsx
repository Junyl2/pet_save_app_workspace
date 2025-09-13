'use client';
import styles from './ContactDrawer.module.css';
import { IoCallOutline } from 'react-icons/io5';

interface ContactDrawerProps {
  onClose: () => void;
}

export const ContactDrawer = ({ onClose }: ContactDrawerProps) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.callButton}>
          <IoCallOutline size={20} className={styles.call} />
          통화 05049763241 - 66BFA7
        </button>
        <button className={styles.cancelButton} onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
};
