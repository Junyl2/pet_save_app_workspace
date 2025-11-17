'use client';

import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import styles from './ToastContainer.module.css';

interface ToastContainerProps {
  toast: { message: string; type: 'success' | 'error' } | null;
  onClose: () => void;
}

export function ToastContainer({ toast, onClose }: ToastContainerProps) {
  if (!toast) return null;

  return (
    <div className={styles.container}>
      <ToastMessage
        message={toast.message}
        onClose={onClose}
        duration={3000}
      />
    </div>
  );
}

