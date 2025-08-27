import { CustomerReviews } from './CustomerReview/CustomerReview';
import { ReviewHeader } from './ReviewHeader/ReviewHeader';
import styles from './MainCustomerReview.module.css';
export default function MainCustomerReview() {
  return (
    <>
      <div className={styles.container}>
        <ReviewHeader />
        <CustomerReviews productId={1} />
      </div>
    </>
  );
}
