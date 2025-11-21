'use client';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './SellerPanel.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';
import { useUser } from '@/app/context/userContext';

interface SellerPanelProps {
  show?: boolean;
}

export default function SellerPanel({ show = true }: SellerPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const isHomepage = pathname.startsWith('/client/pages/homepage');

  if (!show || !user || user.role !== 'seller' || !user.storeId) return null;

  return (
    <div className={styles.container}>
      <div className={styles.sellerPanel}>
        {isHomepage && (
          <div className={styles.sellerButtons}>
            <button
              className={styles.sellerButton}
              onClick={() => router.push(PAGE_URLS.REGISTER_PRODUCT)}
            >
              상품 등록
            </button>

            <button
              className={styles.sellerButton2}
              onClick={() =>
                router.push('/client/seller/pages/seller-product-list')
              }
            >
              상품 리스트
            </button>
          </div>
        )}

        <button
          className={styles.plusButton}
          onClick={() => router.push(PAGE_URLS.REGISTER_PRODUCT)}
        >
          <Image
            src="/images/icons/plus-button.svg"
            alt="Add Product"
            width={14}
            height={14}
            className={styles.plusIcon}
          />
        </button>
      </div>
    </div>
  );
}
