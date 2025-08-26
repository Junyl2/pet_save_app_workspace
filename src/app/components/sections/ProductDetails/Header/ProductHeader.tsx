'use client';
import Image from 'next/image';
import { FaChevronLeft } from 'react-icons/fa';
import styles from './ProductHeader.module.css';
import { useRouter } from 'next/navigation';

export const ProductHeader = () => {
  const router = useRouter();

  return (
    <div className={styles.icons}>
      {/* Back Button */}
      <button
        className={styles.backButton}
        onClick={() => window.history.back()}
      >
        <FaChevronLeft className={styles.backIcon} />
      </button>

      {/* Top Icons */}
      <div className={styles.topIcons}>
        <button
          className={styles.iconBtn}
          onClick={() => router.push('/client/pages/homepage')}
          aria-label="홈으로 이동"
        >
          <Image
            src="/images/icons/bottom-bar/home-active.png"
            alt="Home"
            width={27}
            height={30}
          />
        </button>

        <button className={styles.iconBtn}>
          <Image
            src="/images/icons/Bell.svg"
            alt="Notification"
            width={27}
            height={30}
          />
        </button>

        <button className={styles.iconBtn}>
          <Image
            src="/images/icons/Cart.png"
            alt="Cart"
            width={27}
            height={30}
          />
        </button>
      </div>
    </div>
  );
};
