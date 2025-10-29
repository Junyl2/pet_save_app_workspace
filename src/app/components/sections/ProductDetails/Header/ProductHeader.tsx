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
  const isSellerBusinessInformation = pathname.startsWith(
    '/client/seller/pages/my-page/business-information/seller-business-information'
  );
  const isChangeSellerProfile = pathname.startsWith(
    '/client/seller/pages/change-profile'
  );
  const isShoplist = pathname.startsWith('/shops');

  const isReturnExchangeFlow =
    pathname.includes('/client/pages/my-page/order-history/') &&
    (pathname.includes('/tracking/return') ||
      pathname.includes('/tracking/exchange'));

  const handleBack = () => {
    if (isInquiryPage) {
      router.push('/client/pages/inquiries'); // go to inbox
    } else if (isContactUs) {
      router.push('/client/pages/homepage');
    } else if (isShoplist) {
      router.push('/shops');
    } else if (isOrderConfirmation) {
      router.push('/shopping-cart');
    } else if (isSellerBusinessInformation) {
      router.push('/client/seller/pages/my-page');
    } else if (isChangeSellerProfile) {
      window.history.back(); // Use browser back for proper navigation
    } else if (isReturnExchangeFlow) {
      window.history.back();
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
