'use client';
import { useRouter, usePathname } from 'next/navigation';
import styles from './SellerPanel.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';

interface SellerPanelProps {
  show?: boolean;
}

export default function SellerPanel({ show = true }: SellerPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHomepage = pathname.startsWith('/client/pages/homepage');

  if (!show) return null;

  return (
    <div className={styles.container}>
      <div className={styles.sellerPanel}>
        {isHomepage && (
          <>
            <button
              className={styles.sellerButton}
              onClick={() => router.push(PAGE_URLS.REGISTER_PRODUCT)}
            >
              상품 등록
            </button>
            <button
              className={styles.sellerButton2}
              onClick={() => router.push('/seller/product-list')}
            >
              상품 리스트
            </button>
          </>
        )}

        <button
          className={styles.plusButton}
          onClick={() => router.push('/seller/add-product')}
        >
          ＋
        </button>
      </div>
    </div>
  );
}
