'use client';
import styles from './TopIcons.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { PAGE_URLS } from '@/app/utils/page_url';
import Image from 'next/image';
import { useCartQuantity } from '@/app/components/hooks/use-cart-quantity';

export const TopIcons = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { totalProducts } = useCartQuantity();

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
        <Image
          src="/images/icons/Bell.svg"
          alt="Notification"
          width={27}
          height={30}
        />
      </button>

      {/* go to cart page */}
      {pathname !== PAGE_URLS.DELIVERY_PAYMENT &&
        pathname !== PAGE_URLS.ORDER_CONFIRMATION &&
        pathname !== PAGE_URLS.SHOPPING_CART &&
        pathname !== '/shopping-cart/delivery-payment' && (
          <button
            className={styles.iconBtn}
            onClick={() => router.push('/shopping-cart')}
            style={{ position: 'relative' }}
          >
            <Image
              src="/images/icons/Cart.png"
              alt="Cart"
              width={27}
              height={30}
            />
            {totalProducts > 0 && (
              <span className={styles.cartBadge}>
                {totalProducts > 99 ? '99+' : totalProducts}
              </span>
            )}
          </button>
        )}
    </div>
  );
};
