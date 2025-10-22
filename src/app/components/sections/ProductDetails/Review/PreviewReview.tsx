'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';
import { IoStarSharp } from 'react-icons/io5';
import { Review } from '@/app/api/types/member/review/review';
import styles from './PreviewReview.module.css';
import { BiChevronRight } from 'react-icons/bi';
import Image from 'next/image';

interface CustomerReviewProps {
  productId: string | number;
}

const ReviewItem = ({ review }: { review: Review }) => {
  return (
    <li className={styles.reviewItem}>
      <Image
        src={
          review.reviewer.profileImageUrl || '/images/icons/profile-default.png'
        }
        alt={review.reviewer.name}
        className={styles.avatar}
        height={35}
        width={35}
      />
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

export const PreviewReview = ({ productId }: CustomerReviewProps) => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ReviewService.searchReviews({
          productId: productId.toString(),
          page: 0,
          size: 5,
          sortBy: 'createdAt',
          direction: 'desc',
        });
        if (res.error) {
          setError(res.error);
        } else {
          // Filter reviews to ensure they match the current productId
          const filteredReviews = (res.data?.content || []).filter(
            (review) => review.product.productId === productId.toString()
          );
          setReviews(filteredReviews);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 에러가 발생했습니다.');
        }
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
          onClick={() =>
            router.push(`/customer-reviews?productId=${productId}`)
          }
        >
          전체보기
          <BiChevronRight size={22} className={styles.viewIcon} />
        </button>
      </div>

      <ul className={styles.reviewList}>
        {reviews.map((review) => (
          <ReviewItem key={review.reviewId} review={review} />
        ))}
      </ul>
    </section>
  );
};
