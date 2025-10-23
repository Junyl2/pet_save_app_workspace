'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LogoutModal.module.css';
import { AuthService } from '@/app/api/services/client/auth/authService';
import { useUser } from '@/app/context/userContext';

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
  const { logout: logoutUser } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);

    try {
      console.log('Starting logout process...');

      // Call the real logout API
      const response = await AuthService.logout();

      if (response.error) {
        console.error('Logout failed:', response.error);
        // Still proceed with logout even if API fails
      } else {
        console.log('Logout successful:', response.data);
      }

      // Clear user context state
      logoutUser();
      console.log('User context cleared');

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
      logoutUser(); // Clear user context even on error

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
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M5 12C5 10.8954 5.89543 10 7 10H17C18.1046 10 19 10.8954 19 12V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V12Z"
                stroke="#7DB59A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="15" r="1" fill="#7DB59A" />
            </svg>
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
