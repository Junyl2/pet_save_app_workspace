'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck } from 'react-icons/fa';
import styles from './SuccessMessage.module.css';

interface SuccessMessageProps {
  isVisible: boolean;
  message: string;
  actionText?: string;
  actionRoute?: string;
  onAction?: () => void;
  onHide: () => void;
  duration?: number;
  type?: 'success' | 'warning' | 'error' | 'info';
}

export function SuccessMessage({
  isVisible,
  message,
  actionText = '이동',
  actionRoute,
  onAction,
  onHide,
  duration = 4000,
  type = 'success',
}: SuccessMessageProps) {
  const router = useRouter();
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);

  const handleHide = useCallback(() => {
    setIsAnimationVisible(false);
    // wait for hide animation to finish
    const t = setTimeout(() => onHide(), 300);
    return () => clearTimeout(t);
  }, [onHide]);

  const handleAction = useCallback(() => {
    if (onAction) {
      onAction();
    } else if (actionRoute) {
      router.push(actionRoute);
    }
    handleHide();
  }, [onAction, actionRoute, router, handleHide]);

  useEffect(() => {
    if (!isVisible) {
      setIsAnimationVisible(false);
      return;
    }

    setIsAnimationVisible(true);
    const hideTimer = setTimeout(() => {
      handleHide();
    }, duration);

    return () => clearTimeout(hideTimer);
  }, [isVisible, duration, handleHide]);

  if (!isVisible) return null;

  const messageClassNames = [
    styles.successMessage,
    isAnimationVisible ? styles.visible : '',
    styles[type],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={messageClassNames}>
      <div className={styles.messageContent}>
        <FaCheck className={styles.successIcon} />
        <p className={styles.messageText}>{message}</p>
      </div>
      {actionText && (actionRoute || onAction) && (
        <button className={styles.actionButton} onClick={handleAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
