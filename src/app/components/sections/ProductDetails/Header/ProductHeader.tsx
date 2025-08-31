'use client';
import Image from 'next/image';
import { FaChevronLeft } from 'react-icons/fa';
import styles from './ProductHeader.module.css';
import { useRouter, usePathname } from 'next/navigation';

export const ProductHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we are on inquiries page or its subpages
  const isInquiryPage = pathname.startsWith('/client/pages/inquiries');
  const isContactUs = pathname.startsWith('/contact-us');

  const handleBack = () => {
    if (isInquiryPage) {
      router.push('/client/pages/inquiries'); // go to inbox
    } else if (isContactUs) {
      router.push('/client/pages/homepage');
    } else {
      window.history.back(); // default behavior
    }
  };

  return (
    <div className={styles.icons}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={handleBack}>
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
