'use client';

import { useRouter, usePathname } from 'next/navigation';
import ContactInbox from '@/app/components/pages/contact-us/ContactInbox';
import styles from './styles.module.css';

function Frame1575Tabs() {
  const router = useRouter();
  const pathname = usePathname();
  const isHistory = pathname?.includes('/history-inquiry');

  return (
    <div className={styles.topTabsBar}>
      <button
        className={`${styles.topTab} ${
          isHistory ? styles.topTabActive : styles.topTabInactive
        }`}
      >
        문의내역
      </button>
      <button
        className={`${styles.topTab} ${
          !isHistory ? styles.topTabActive : styles.topTabInactive
        }`}
        onClick={() =>
          router.push('/client/pages/my-page/history-inquiry/contact-seller')
        }
      >
        문의하기
      </button>
    </div>
  );
}

export default function HistoryInquiryPage() {
  return (
    <ContactInbox
      hideMenu
      initialRange="1개월"
      extraActionsRender={<Frame1575Tabs />}
    />
  );
}
