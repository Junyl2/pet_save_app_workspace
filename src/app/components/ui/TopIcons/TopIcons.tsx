'use client';
import Image from 'next/image';
import styles from './TopIcons.module.css';
import { useRouter, usePathname } from 'next/navigation';

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
          <Image
            src="/images/icons/bottom-bar/home-active.png"
            alt="Notification"
            width={27}
            height={30}
            className={styles.logo}
          />
        </button>
      )}

      {/* go to notifcations */}
      <button className={styles.iconBtn}>
        <Image
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
          <Image
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
