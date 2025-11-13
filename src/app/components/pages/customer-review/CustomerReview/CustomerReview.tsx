'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { IoStarSharp } from 'react-icons/io5';
import { FiMoreHorizontal } from 'react-icons/fi';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';
import {
  Review,
  ReviewSearchParams,
} from '@/app/api/types/member/review/review';
import ReportModal from '@/app/components/ui/modal/ReportModal/ReportModal';
import { ReviewImageGallery } from '@/app/components/ui/Gallery/ReviewImageGallery';
import styles from './CustomerReviews.module.css';

interface CustomerReviewsProps {
  productId: string;
}

const PAGE_SIZE = 10;

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

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(0); // 0-based for API
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(
    async (page: number) => {
      if (isLoadingMore && page > 0) return;

      const isInitialLoad = page === 0;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const searchParams: ReviewSearchParams = {
          page: page, // zero-based for API
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
        };

        if (productId?.trim()) searchParams.productId = productId;

        const res = await ReviewService.searchReviews(searchParams);

        if (res.error) {
          setError(res.error);
        } else {
          const data = res.data;
          const content = data?.content ?? [];
          const filteredReviews = content.filter(
            (r) => r.product?.productId === productId
          );

          if (page === 0) {
            setReviews(filteredReviews);
          } else {
            setReviews((prev) => [...prev, ...filteredReviews]);
          }

          setHasMore(data?.pageInfo?.hasNext ?? false);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.'
        );
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [productId, isLoadingMore]
  );

  // Load initial page
  useEffect(() => {
    setCurrentPage(0);
    setReviews([]);
    setHasMore(true);
    void loadPage(0);
  }, [productId, loadPage]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !loading
        ) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          void loadPage(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loading, currentPage, loadPage]);

  if (loading && reviews.length === 0)
    return <p className={styles.loading}>리뷰를 불러오는 중...</p>;
  if (error) return <p className={styles.noReviews}>에러: {error}</p>;
  if (reviews.length === 0 && !loading)
    return <p className={styles.noReviews}>등록된 리뷰가 없습니다.</p>;

  return (
    <>
      <div className={styles.reviewList}>
        {reviews.map((review) => (
          <div key={review.reviewId} className={styles.reviewCard}>
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

            {review.imageUrls?.length ? (
              <ReviewImageGallery images={review.imageUrls} />
            ) : null}

            <p className={styles.content}>{review.content}</p>

            {reportReviewId === review.reviewId && (
              <ReportModal
                show={true}
                onClose={() => setReportReviewId(null)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
      )}

      {/* Loading indicator for loading more */}
      {isLoadingMore && (
        <p className={styles.loading} style={{ marginTop: '1rem' }}>
          리뷰를 불러오는 중...
        </p>
      )}
    </>
  );
};
