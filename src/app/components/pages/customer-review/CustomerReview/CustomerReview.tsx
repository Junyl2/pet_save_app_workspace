'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { IoStarSharp } from 'react-icons/io5';
import { FiMoreHorizontal } from 'react-icons/fi';
import { mainCustomerReviewService } from '@/app/api/services/main-customer-review/mainCustomerReview';
import { MainCustomerReview } from '@/app/api/types/review/MainReview';
import ReportModal from '@/app/components/ui/modal/ReportModal/ReportModal';
import styles from './CustomerReviews.module.css';

interface CustomerReviewsProps {
  productId: number;
}

export const CustomerReviews = ({ productId }: CustomerReviewsProps) => {
  const [reviews, setReviews] = useState<MainCustomerReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Track which review menu is open
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  // Track which review's report modal is open
  const [reportReviewId, setReportReviewId] = useState<number | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const res = await mainCustomerReviewService.getReviewsByProduct(
        productId
      );
      setReviews(res);
      setLoading(false);
    };
    fetchReviews();
  }, [productId]);

  if (loading) return <p className={styles.loading}>리뷰를 불러오는 중...</p>;
  if (reviews.length === 0)
    return <p className={styles.noReviews}>등록된 리뷰가 없습니다.</p>;

  return (
    <div className={styles.reviewList}>
      {reviews.map((review) => (
        <div key={review.id} className={styles.reviewCard}>
          {/* Horizontal three-dot menu */}
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuBtn}
              onClick={() =>
                setOpenMenuId((prev) => (prev === review.id ? null : review.id))
              }
            >
              <FiMoreHorizontal size={20} />
            </button>
          </div>

          {openMenuId === review.id && (
            <div className={styles.dropdown}>
              <button
                onClick={() => {
                  setOpenMenuId(null);
                  setReportReviewId(review.id);
                }}
                className={styles.onReportButton}
              >
                신고하기
              </button>
            </div>
          )}

          <div className={styles.header}>
            <Image
              src={review.avatar}
              alt={review.author}
              width={40}
              height={40}
              className={styles.avatar}
            />
            <div className={styles.right}>
              {/* Rating with Comment */}
              <div className={styles.rating}>
                {review.ratingComment && (
                  <span className={styles.ratingComment}>
                    {review.ratingComment}
                  </span>
                )}
                {[1, 2, 3, 4, 5].map((i) => (
                  <IoStarSharp
                    key={i}
                    size={18}
                    color={i <= review.rating ? '#FFC71F' : '#D9D9D9'}
                  />
                ))}
              </div>

              {/* Author and Date */}
              <div className={styles.authorDate}>
                <p className={styles.author}>{review.author}</p>
                <span className={styles.divide}> | </span>
                <p className={styles.date}>{review.date}</p>
              </div>
            </div>
          </div>

          {review.productName && (
            <p className={styles.productName}>{review.productName}</p>
          )}

          {review.images && review.images.length > 0 && (
            <div className={styles.images}>
              {review.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`review-${review.id}-img-${idx}`}
                  width={100}
                  height={100}
                  className={styles.reviewImage}
                />
              ))}
            </div>
          )}

          <p className={styles.content}>{review.content}</p>

          {/* Report Modal per review */}
          {reportReviewId === review.id && (
            <ReportModal show={true} onClose={() => setReportReviewId(null)} />
          )}
        </div>
      ))}
    </div>
  );
};
