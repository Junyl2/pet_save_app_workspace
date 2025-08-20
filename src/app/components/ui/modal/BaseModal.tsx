'use client';

import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import styles from './BaseModal.module.css';

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children?: React.ReactNode;
  titleClassName?: string;
  withOverlay?: boolean;
  noRadius?: boolean;
}

export const BaseModal = ({
  open,
  onClose,
  title,
  className = '',
  titleClassName = '',
  children,
  withOverlay = true,
  noRadius = false,
}: BaseModalProps) => {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!open) return null;

  const modalClass = `${styles.modal} ${
    noRadius ? styles.noRadius : ''
  } ${className}`;

  const content = (
    <div className={modalClass} onClick={(e) => e.stopPropagation()}>
      {/*    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <FiX size={22} />
      </button> */}
      {title && (
        <h2 className={`${styles.title} ${titleClassName}`}>{title}</h2>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );

  return withOverlay ? (
    <div className={styles.overlay} onClick={onClose}>
      {content}
    </div>
  ) : (
    content
  );
};
