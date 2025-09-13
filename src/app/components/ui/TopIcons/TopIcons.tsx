'use client';
import styles from './TopIcons.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { PAGE_URLS } from '@/app/utils/page_url';

export const TopIcons = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={styles.icons}>
      {pathname !== '/client/pages/homepage' && (
        <button
          className={styles.iconBtn}
          onClick={() => router.push('/client/pages/homepage')}
          aria-label="홈으로 이동"
        >
          {/* go to homepage */}
          <img
            src="/images/icons/bottom-bar/home-active.png"
            alt="Home"
            width={27}
            height={30}
            className={styles.logo}
          />
        </button>
      )}

      {/* go to notifications */}
      <button 
        className={styles.iconBtn}
        onClick={() => router.push(PAGE_URLS.NOTIFICATIONS)}
        aria-label="알림으로 이동"
      >
        <img
          src="/images/icons/Bell.svg"
          alt="Notification"
          width={27}
          height={30}
        />
      </button>

      {/* go to cart page */}
      {pathname !== '/shopping-cart' && (
        <button
          className={styles.iconBtn}
          onClick={() => router.push('/shopping-cart')}
        >
          <img
            src="/images/icons/Cart.png"
            alt="Cart"
            width={27}
            height={30}
          />
        </button>
      )}
    </div>
  );
};
