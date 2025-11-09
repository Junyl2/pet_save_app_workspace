'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaStar } from 'react-icons/fa';
import styles from './ViewReview.module.css';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';
import { Review } from '@/app/api/types/member/review/review';
import Loading from '@/app/components/ui/Loading/Loading';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { setHasLoadedOnce } from '@/app/redux/slices/auth/ui/loadingSlice';
import { DotMenu } from '@/app/components/ui/DotMenu/DotMenu';
import { ReviewImageGallery } from '@/app/components/ui/Gallery/ReviewImageGallery';

export default function ViewReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reviewId = searchParams.get('reviewId');
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedOnce = useAppSelector(
    (state) => state.loading.hasLoadedOnce[`view-review-${reviewId}`] || false
  );
  const [loading, setLoading] = useState<boolean>(!hasLoadedOnce);

  useEffect(() => {
    let isMounted = true;

    if (!hasLoadedOnce) setLoading(true);
    setError(null);

    const fetchReview = async () => {
      if (!reviewId) {
        setError('리뷰 ID가 필요합니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await ReviewService.getReviewById(reviewId);
        if (!isMounted) return;

        if (response.error) {
          setError('리뷰를 불러올 수 없습니다.');
        } else if (response.data) {
          setReview(response.data);
          dispatch(setHasLoadedOnce(`view-review-${reviewId}`));
        } else {
          setError('리뷰 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to fetch review:', err);
        setError('리뷰를 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchReview();
    return () => {
      isMounted = false;
    };
  }, [reviewId, hasLoadedOnce, dispatch]);

  const handleEditReview = () => {
    router.push(`/client/pages/my-page/reviews/edit?reviewId=${reviewId}`);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`${styles.star} ${
          i < rating ? styles.starFilled : styles.starEmpty
        }`}
      />
    ));

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

  if (loading) return <Loading />;

  if (error || !review) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.content}>
          <p className={styles.error}>
            {error || '리뷰를 불러올 수 없습니다.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProductHeader />

      <div className={styles.content}>
        {/* Tab Navigation */}
        <div className={styles.tabContainer}>
          <button
            className={styles.tab}
            onClick={() => router.push('/client/pages/my-page/reviews')}
          >
            리뷰 쓰기
          </button>
          <button className={`${styles.tab} ${styles.activeTab}`}>
            내가 쓴 리뷰
          </button>
        </div>

        {/* Review Content */}
        <div className={styles.reviewContainer}>
          <div className={styles.reviewHeader}>
            <div className={styles.userInfo}>
              <div className={styles.profileImage}>
                <img
                  src={
                    review.reviewer.profileImageUrl ||
                    '/images/icons/profile-default.png'
                  }
                  alt="Profile"
                />
              </div>
              <div className={styles.userDetails}>
                <div className={styles.usernameAndRating}>
                  <span className={styles.username}>
                    {getRatingComment(review.rating)}
                  </span>
                  <div className={styles.starsContainer}>
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className={styles.userIdAndDate}>
                  {review.reviewer.name} |{' '}
                  {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>

            <div className={styles.headerActions}>
              <DotMenu mode="editOnly" onEdit={handleEditReview} />
            </div>
          </div>

          {/* Product Name */}
          <div className={styles.productName}>{review.product.productName}</div>

          {/* Review Images with zoom modal */}
          {review.imageUrls?.length ? (
            <div className={styles.imagesContainer}>
              <ReviewImageGallery images={review.imageUrls} />
            </div>
          ) : null}

          {/* Review Text */}
          <div className={styles.reviewText}>{review.content}</div>
        </div>
      </div>
    </div>
  );
}
