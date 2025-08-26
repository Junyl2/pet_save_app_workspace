'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reviewService } from '@/app/api/services/review-service/reviewService';
import { IoStarSharp } from 'react-icons/io5';
import { Review } from '@/app/api/types/review/review';
import styles from './CustomerReview.module.css';
import { BiChevronRight } from 'react-icons/bi';

interface CustomerReviewProps {
  productId: number;
}

const ReviewItem = ({ review }: { review: Review }) => {
  return (
    <li className={styles.reviewItem}>
      <img src={review.avatar} alt={review.author} className={styles.avatar} />
      <div className={styles.reviewContent}>
        <div className={styles.rating}>
          {[1, 2, 3, 4, 5].map((i) => (
            <IoStarSharp
              key={i}
              color={i <= review.rating ? '#FFC71F' : '#D9D9D9'}
              size={16}
            />
          ))}
        </div>
        <p className={styles.content}>{review.content}</p>
      </div>
    </li>
  );
};

export const CustomerReview = ({ productId }: CustomerReviewProps) => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await reviewService.getByProductId(productId);
        if (res.error) setError(res.error);
        else setReviews(res.data.slice(0, 5));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  if (loading) return <p className={styles.message}>로딩 중...</p>;
  if (error) return <p className={styles.message}>에러: {error}</p>;
  if (!reviews.length)
    return <p className={styles.message}>아직 리뷰가 없습니다.</p>;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.reviewTitle}>이 상품의 리뷰보기</h3>
        <button
          className={styles.viewAll}
          onClick={() => router.push(`/client/pages/customer-review`)}
        >
          전체보기
          <BiChevronRight size={22} className={styles.viewIcon} />
        </button>
      </div>

      <ul className={styles.reviewList}>
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </ul>
    </section>
  );
};
