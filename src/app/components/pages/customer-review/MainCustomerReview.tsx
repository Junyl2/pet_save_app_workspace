'use client';

import { CustomerReviews } from './CustomerReview/CustomerReview';
import styles from './MainCustomerReview.module.css';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import { useSearchParams } from 'next/navigation';

export default function MainCustomerReview() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  return (
    <>
      <div className={styles.container}>
        <ProductHeader />
        <CustomerReviews productId={productId || ''} />
      </div>
    </>
  );
}
