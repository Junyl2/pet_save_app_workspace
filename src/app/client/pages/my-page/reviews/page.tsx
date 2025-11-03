'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaStar } from 'react-icons/fa';
import ReviewSkeleton from '@/app/components/ui/SkeletonLoading/ReviewSkeleton/ReviewSkeleton';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import {
  fetchReviews,
  fetchMyReviews,
  revalidateMyReviewsInBackground,
  checkStaleStatus,
  ReviewCacheKey,
} from '@/app/redux/slices/cache/reviewSlice';
import { setHasLoadedOnce } from '@/app/redux/slices/auth/ui/loadingSlice';
import { MyReviewsParams } from '@/app/api/types/member/review/review';
import { orderDetailsService } from '@/app/api/services/client/memberService/order/oderDetailsService';
import { OrderItemResponse } from '@/app/api/types/member/order/orderDetails';
import styles from './Reviews.module.css';

// Helper: convert rating to Korean comment
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

export default function ReviewsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'write' | 'my-reviews'>('write');
  const [reviewableProducts, setReviewableProducts] = useState<
    OrderItemResponse[]
  >([]);
  const [loadingReviewable, setLoadingReviewable] = useState<boolean>(true);
  const [errorReviewable, setErrorReviewable] = useState<string | null>(null);

  // Redux review cache
  const { cache, loading, error } = useAppSelector((state) => state.reviews);

  const hasLoadedOnce = useAppSelector(
    (state) => state.loading.hasLoadedOnce[`reviews-page-${activeTab}`] || false
  );

  const getCurrentCacheKey = (): string =>
    activeTab === 'my-reviews'
      ? `my_reviews_0_50_createdAt_desc`
      : `all_all_all_0_50_createdAt_desc`;

  const currentCacheKeyString = getCurrentCacheKey();
  const cachedData = cache[currentCacheKeyString];
  const writtenReviews = useMemo(
    () => cachedData?.reviews || [],
    [cachedData?.reviews]
  );

  const formatPrice = (price: number) => `${price.toLocaleString('ko-KR')}원`;

  const handleWriteReview = (productId: string) => {
    router.push(`/client/pages/my-page/reviews/write?productId=${productId}`);
  };

  const handleViewReview = (reviewId: string) => {
    router.push(`/client/pages/my-page/reviews/view?reviewId=${reviewId}`);
  };

  /** ✅ Fetch reviewable products using onlyReviewable=true */
  useEffect(() => {
    const fetchReviewable = async () => {
      try {
        setLoadingReviewable(true);
        const { data, error } = await orderDetailsService.getMyOrderHistory({
          onlyReviewable: true,
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          direction: 'desc',
        });

        if (error) {
          setErrorReviewable(error);
          setReviewableProducts([]);
        } else if (data?.data?.content) {
          setReviewableProducts(data.data.content);
        } else {
          setReviewableProducts([]);
        }
      } catch (err) {
        setErrorReviewable('리뷰 가능한 상품을 불러오지 못했습니다.');
        setReviewableProducts([]);
      } finally {
        setLoadingReviewable(false);
      }
    };

    fetchReviewable();
  }, []);

  /** ✅ Redux fetch for reviews */
  useEffect(() => {
    if (activeTab === 'my-reviews') {
      dispatch(
        fetchMyReviews({
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          direction: 'desc',
        })
      );
    } else {
      const cacheKeyParams: ReviewCacheKey = {
        page: 0,
        size: 50,
        sortBy: 'createdAt',
        direction: 'desc',
      };
      dispatch(fetchReviews(cacheKeyParams));
    }

    dispatch(setHasLoadedOnce(`reviews-page-${activeTab}`));
  }, [dispatch, activeTab]);

  /** Background revalidation for my reviews */
  useEffect(() => {
    if (activeTab === 'my-reviews' && writtenReviews.length > 0) {
      const cacheKey = `my_reviews_0_50_createdAt_desc`;
      const cached = cache[cacheKey];
      if (cached) {
        const now = Date.now();
        const isStale = now - cached.timestamp >= 10_000;
        if (isStale) {
          const params: MyReviewsParams = {
            page: 0,
            size: 50,
            sortBy: 'createdAt',
            direction: 'desc',
          };
          dispatch(revalidateMyReviewsInBackground(params));
        }
      }
    }
  }, [dispatch, activeTab, writtenReviews.length, cache]);

  /** Check stale status */
  useEffect(() => {
    if (activeTab === 'my-reviews') dispatch(checkStaleStatus());
  }, [dispatch, activeTab, writtenReviews]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`${styles.star} ${
          i < rating ? styles.starFilled : styles.starEmpty
        }`}
      />
    ));

  const shouldShowLoading =
    loading && !hasLoadedOnce && activeTab === 'my-reviews';
  if (shouldShowLoading) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <ReviewSkeleton activeTab={activeTab} />
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
            className={`${styles.tab} ${
              activeTab === 'write' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('write')}
          >
            리뷰 쓰기
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === 'my-reviews' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('my-reviews')}
          >
            내가 쓴 리뷰
          </button>
        </div>

        {/* Write Tab */}
        {activeTab === 'write' ? (
          <div key="write-tab" className={styles.writeReviewSection}>
            <div className={styles.sectionTitle}>
              쓸 수 있는 리뷰 {reviewableProducts.length}개
            </div>

            {loadingReviewable ? (
              <div className={styles.emptyState}>로딩 중...</div>
            ) : errorReviewable ? (
              <div className={styles.emptyState}>
                오류가 발생했습니다: {errorReviewable}
              </div>
            ) : reviewableProducts.length === 0 ? (
              <div className={styles.emptyState}>
                아직 리뷰 가능한 상품이 없습니다.
              </div>
            ) : (
              <div className={styles.productList}>
                {reviewableProducts.map((product) => (
                  <div key={product.orderItemId} className={styles.productItem}>
                    <div className={styles.productImage}>
                      <img
                        src={product.productImageUrl}
                        alt={product.productName}
                      />
                    </div>

                    <div className={styles.productInfo}>
                      <div className={styles.productName}>
                        {product.productName}
                      </div>
                      <div className={styles.productPrice}>
                        {formatPrice(product.price)}
                      </div>
                      <div className={styles.productStore}>
                        {product.storeName}
                      </div>
                    </div>

                    <button
                      className={styles.reviewButton}
                      onClick={() => handleWriteReview(product.productId)}
                    >
                      리뷰쓰기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /** My Reviews Tab */
          <div key="my-reviews-tab" className={styles.myReviewsSection}>
            {error ? (
              <div className={styles.emptyState}>에러: {error}</div>
            ) : writtenReviews.length > 0 ? (
              <div className={styles.detailedReviewContainer}>
                {writtenReviews.map((review) => (
                  <div key={review.reviewId} className={styles.detailedReview}>
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
                            {new Date(review.createdAt).toLocaleDateString(
                              'ko-KR'
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        className={styles.editButton}
                        onClick={() => handleViewReview(review.reviewId)}
                      >
                        리뷰보기
                      </button>
                    </div>

                    <div className={styles.reviewProductName}>
                      {review.productName}
                    </div>

                    {review.imageUrls?.length > 0 && (
                      <div className={styles.reviewImagesContainer}>
                        {review.imageUrls.map((image, idx) => (
                          <div
                            key={`${review.reviewId}-image-${idx}`}
                            className={styles.reviewImageItem}
                          >
                            <img src={image} alt="Review image" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.reviewTextContent}>
                      {review.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                아직 작성한 리뷰가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
