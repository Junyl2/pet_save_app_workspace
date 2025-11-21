'use client';

import styles from './AdminOffline.module.css';
import { useRouter, usePathname } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();
  const pathname = usePathname();

  const handleRetry = (): void => {
    if (pathname.includes('/admin')) {
      router.push('/admin');
    } else {
      router.back();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.illustration}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 300"
            width="220"
            height="220"
            aria-hidden="true"
          >
            <circle cx="200" cy="150" r="120" fill="#E8F8F4" />
            <path
              d="M200 80c-40 0-80 40-80 80h160c0-40-40-80-80-80z"
              fill="#66BFA7"
            />
            <rect x="170" y="160" width="60" height="40" rx="8" fill="#333" />
            <circle cx="190" cy="180" r="5" fill="#fff" />
            <circle cx="210" cy="180" r="5" fill="#fff" />
          </svg>
        </div>

        <h1 className={styles.title}>You’re Offline</h1>
        <p className={styles.subtitle}>
          It looks like your internet connection is lost.
          <br />
          Please reconnect to continue using the app.
        </p>
        <button
          type="button"
          className={styles.retryButton}
          onClick={handleRetry}
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
