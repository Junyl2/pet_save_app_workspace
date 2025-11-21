'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import styles from './LogoutModal.module.css';
import { logoutUser } from '@/app/redux/slices/auth/authSLice';
import { AppDispatch } from '@/app/redux/store';
import Image from 'next/image';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);

    try {
      console.log('Starting logout process...');

      // Dispatch the logout action which will clear all cached data
      await dispatch(logoutUser());

      console.log('Logout completed successfully');

      // Call custom logout handler if provided
      if (onConfirm) {
        onConfirm();
      }

      // Force a small delay to ensure all state is cleared before redirect
      setTimeout(() => {
        // Redirect to login page
        router.push('/client/login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Still proceed with logout even if there's an error

      // Force a small delay to ensure all state is cleared before redirect
      setTimeout(() => {
        router.push('/client/login');
      }, 100);
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Lock Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.lockIcon}>
            <Image
              src="/images/icons/logout.svg"
              alt="lock"
              width={55}
              height={61}
            />
          </div>
        </div>

        {/* Title */}
        <h2 className={styles.title}>로그아웃 하시겠어요?</h2>

        {/* Message */}
        <p className={styles.message}>언제든 다시 로그인할 수 있어요!</p>

        {/* Buttons */}
        <div className={styles.buttonContainer}>
          <button
            className={styles.confirmButton}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? '로그아웃 중...' : '로그아웃하기'}
          </button>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoggingOut}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
