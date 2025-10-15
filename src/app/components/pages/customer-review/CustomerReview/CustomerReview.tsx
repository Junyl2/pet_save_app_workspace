'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { IoStarSharp } from 'react-icons/io5';
import { FiMoreHorizontal } from 'react-icons/fi';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';
import { Review } from '@/app/api/types/member/review/review';
import ReportModal from '@/app/components/ui/modal/ReportModal/ReportModal';
import styles from './CustomerReviews.module.css';

interface CustomerReviewsProps {
  productId: string;
}

// Helper function to get Korean rating comment
const getRatingComment = (rating: number): string => {
  switch (rating) {
    case 5:
      return '매우 만족';
    case 4:
      return '만족해요';
    case 3:
      return '보통이에요';
    case 2:
      return '불만족';
    case 1:
      return '매우 불만족';
    default:
      return '보통';
  }
};

export const CustomerReviews = ({ productId }: CustomerReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which review menu is open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Track which review's report modal is open
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ReviewService.searchReviews({
          productId: productId,
          page: 0,
          size: 50, // Get more reviews for the full page
          sortBy: 'createdAt',
          direction: 'desc',
        });
        if (res.error) {
          setError(res.error);
        } else {
          setReviews(res.data?.content || []);
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

  if (loading) return <p className={styles.loading}>리뷰를 불러오는 중...</p>;
  if (error) return <p className={styles.noReviews}>에러: {error}</p>;
  if (reviews.length === 0)
    return <p className={styles.noReviews}>등록된 리뷰가 없습니다.</p>;

  return (
    <div className={styles.reviewList}>
      {reviews.map((review) => (
        <div key={review.reviewId} className={styles.reviewCard}>
          {/* Horizontal three-dot menu */}
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuBtn}
              onClick={() =>
                setOpenMenuId((prev) =>
                  prev === review.reviewId ? null : review.reviewId
                )
              }
            >
              <FiMoreHorizontal size={20} />
            </button>
          </div>

          {openMenuId === review.reviewId && (
            <div className={styles.dropdown}>
              <button
                onClick={() => {
                  setOpenMenuId(null);
                  setReportReviewId(review.reviewId);
                }}
                className={styles.onReportButton}
              >
                신고하기
              </button>
            </div>
          )}

          <div className={styles.header}>
            <Image
              src={
                review.reviewer.profileImageUrl ||
                '/images/icons/profile-default.png'
              }
              alt={review.reviewer.name}
              width={40}
              height={40}
              className={styles.avatar}
            />
            <div className={styles.right}>
              {/* Rating with Comment */}
              <div className={styles.rating}>
                <span className={styles.ratingComment}>
                  {getRatingComment(review.rating)}
                </span>
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
                <p className={styles.author}>{review.reviewer.name}</p>
                <span className={styles.divide}> | </span>
                <p className={styles.date}>
                  {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {review.productName && (
            <p className={styles.productName}>{review.productName}</p>
          )}

          {review.imageUrls && review.imageUrls.length > 0 && (
            <div className={styles.images}>
              {review.imageUrls.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`review-${review.reviewId}-img-${idx}`}
                  width={100}
                  height={100}
                  className={styles.reviewImage}
                />
              ))}
            </div>
          )}

          <p className={styles.content}>{review.content}</p>

          {/* Report Modal per review */}
          {reportReviewId === review.reviewId && (
            <ReportModal show={true} onClose={() => setReportReviewId(null)} />
          )}
        </div>
      ))}
    </div>
  );
};
