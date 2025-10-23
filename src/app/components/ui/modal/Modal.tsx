'use client';

import React, { useEffect, useRef, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string; // default 780 to match your Figma
  height?: number | string; // fixed height for modal body scroll
};

export default function Modal({
  open,
  onClose,
  title,
  width = 780,
  height = 930,
  children,
}: PropsWithChildren<ModalProps>) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Lock background scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Prevent scroll bubbling to body
  const stopScrollPropagation = (e: React.WheelEvent) => {
    const el = dialogRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const delta = e.deltaY;

    if (
      (delta < 0 && scrollTop <= 0) ||
      (delta > 0 && scrollTop + clientHeight >= scrollHeight)
    ) {
      e.preventDefault();
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose} // click backdrop to close
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {title ? <div className={styles.header}>{title}</div> : null}

        {/* Scrollable content area */}
        <div
          className={styles.body}
          ref={dialogRef}
          onWheel={stopScrollPropagation}
        >
          {children}
        </div>

        {/* Footer slot—optional (you can also place actions inside children) */}
      </div>
    </div>,
    document.body
  );
}
