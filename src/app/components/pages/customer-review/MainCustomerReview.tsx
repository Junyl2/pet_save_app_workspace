import { CustomerReviews } from './CustomerReview/CustomerReview';
import { ReviewHeader } from './ReviewHeader/ReviewHeader';
import styles from './MainCustomerReview.module.css';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
export default function MainCustomerReview() {
  return (
    <>
      <div className={styles.container}>
        <ProductHeader />
        <CustomerReviews productId={1} />
      </div>
    </>
  );
}
