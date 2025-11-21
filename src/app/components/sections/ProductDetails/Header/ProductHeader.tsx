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
  const isOrderHistoryItem = pathname.startsWith(
    '/client/pages/my-page/order-history/items'
  );
  const isOrderHistory = pathname.startsWith(
    '/client/pages/my-page/order-history'
  );

  const isReturnExchangeFlow =
    pathname.includes('/client/pages/my-page/order-history') &&
    (pathname.includes('/tracking/return') ||
      pathname.includes('/tracking/exchange'));

  // Check if we're on OrderTracking page (but not return/exchange flow)
  const isOrderTracking =
    pathname.includes('/client/pages/my-page/order-history/') &&
    pathname.includes('/tracking') &&
    !isReturnExchangeFlow;

  const handleBack = () => {
    if (isInquiryPage) {
      router.push('/client/pages/inquiries'); // go to inbox
    } else if (isContactUs) {
      router.push('/client/pages/homepage');
    } else if (isShoplist) {
      router.push('/shops');
    } else if (isOrderHistoryItem) {
      router.back(); // Use router.back() to preserve filter params
    } else if (isOrderTracking) {
      router.back(); // Use router.back() for OrderTracking
    } else if (isOrderHistory) {
      router.push('/client/pages/my-page');
    } else if (isOrderConfirmation) {
      router.push('/client/pages/homepage');
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
