'use client';

import { useState } from 'react';
import styles from './OfflinePage.module.css';
import { useRouter, usePathname } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  const handleRetry = (): void => {
    window.location.reload();

    if (pathname.includes('/admin')) {
      router.push('/admin/login');
    } else {
      router.back();
    }
  };

  const handleOpenSettings = (): void => {
    const ua = navigator.userAgent.toLowerCase();

    if (/android/.test(ua)) {
      window.location.href =
        'intent://settings#Intent;scheme=android.settings.WIFI_SETTINGS;end';
    } else if (/iphone|ipad|ipod/.test(ua)) {
      window.location.href = 'App-Prefs:root=WIFI';
    } else {
      // Desktop fallback → show modal
      setShowModal(true);
    }
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
  };

  const isAdminPage = pathname.includes('/admin');

  return (
    <div className={isAdminPage ? styles.adminContainer : styles.container}>
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

        <h1 className={styles.title}>오프라인 상태입니다</h1>
        <p className={styles.subtitle}>
          인터넷 연결이 끊어졌습니다.
          <br />
          다시 연결 후 앱을 이용해 주세요.
        </p>

        <button
          type="button"
          className={styles.retryButton}
          onClick={handleRetry}
        >
          연결 다시 시도
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleOpenSettings}
        >
          네트워크 설정 열기
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>네트워크 설정 안내</h2>
            <p className={styles.modalMessage}>
              macOS 또는 PC에서는 자동으로 설정을 열 수 없습니다.
              <br />
              메뉴 막대의 <strong>Wi-Fi 아이콘</strong>을 클릭하거나{' '}
              <strong>시스템 설정 &gt; 네트워크</strong>로 이동하여 연결을
              확인하세요.
            </p>
            <button
              type="button"
              className={styles.modalButton}
              onClick={handleCloseModal}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
