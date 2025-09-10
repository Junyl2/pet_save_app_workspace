'use client';
import { FaChevronLeft } from 'react-icons/fa';
import styles from './ProductHeader.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { TopIcons } from '@/app/components/ui/TopIcons/TopIcons';

export const ProductHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we are on inquiries page or its subpages
  const isInquiryPage = pathname.startsWith('/client/pages/inquiries');
  const isContactUs = pathname.startsWith('/contact-us');
  const isOrderConfirmation = pathname.startsWith(
    '/client/pages/shopping-cart/delivery-payment/order-confirmation'
  );

  const handleBack = () => {
    if (isInquiryPage) {
      router.push('/client/pages/inquiries'); // go to inbox
    } else if (isContactUs) {
      router.push('/client/pages/homepage');
    } else if (isOrderConfirmation) {
      router.push('/shopping-cart');
    } else {
      window.history.back(); // default behavior
    }
  };

  return (
    <>
      <div className={styles.icons}>
        {/* Back Button */}
        <button className={styles.backButton} onClick={handleBack}>
          <FaChevronLeft className={styles.backIcon} />
        </button>

        {/* Top Icons */}
        <TopIcons />
      </div>
    </>
  );
};
