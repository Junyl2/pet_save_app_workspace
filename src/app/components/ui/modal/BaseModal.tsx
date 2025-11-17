'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ReactDOM from 'react-dom';
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
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/admin') ?? false;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  const modalClass = `${styles.modal} ${
    noRadius ? styles.noRadius : ''
  } ${className}`;

  const overlayClass = `${styles.overlay} ${
    isAdminPage ? styles.adminOverlay : ''
  }`;

  const tree = (
    <div
      className={overlayClass}
      onClick={(e) => {
        //  This ensures modal closes only when clicking outside
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* visible dim only over your app width (desktop) */}
      {!isAdminPage && <div className={styles.scrim} aria-hidden="true" />}

      <div className={styles.canvas}>
        <div className={modalClass} onClick={(e) => e.stopPropagation()}>
          {title && (
            <h2 className={`${styles.title} ${titleClassName}`}>{title}</h2>
          )}
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </div>
  );

  return withOverlay
    ? ReactDOM.createPortal(tree, document.body)
    : ReactDOM.createPortal(
        <div className={styles.canvas}>{children}</div>,
        document.body
      );
};
