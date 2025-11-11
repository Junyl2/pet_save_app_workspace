'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import ReviewSkeleton from '@/app/components/ui/SkeletonLoading/ReviewSkeleton/ReviewSkeleton';
import ClientPagination from '@/app/components/admin/ui/ClientPagination/ClientPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
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
import Image from 'next/image';

const PAGE_SIZE = 10;

export default function ReviewsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isMountedRef = useRef(true);
  const [activeTab, setActiveTab] = useState<'write' | 'my-reviews'>('write');
  const [reviewableProducts, setReviewableProducts] = useState<
    OrderItemResponse[]
  >([]);
  const [loadingReviewable, setLoadingReviewable] = useState(true);
  const [errorReviewable, setErrorReviewable] = useState<string | null>(null);

  const { page, setPage } = usePageParam(1);
  const { cache, loading, error } = useAppSelector((state) => state.reviews);
  const hasLoadedOnce = useAppSelector(
    (state) => state.loading.hasLoadedOnce[`reviews-page-${activeTab}`] || false
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /** Compute cache key dynamically based on page */
  const cacheKey: ReviewCacheKey = useMemo(
    () => ({
      page: page - 1,
      size: PAGE_SIZE,
      sortBy: 'createdAt',
      direction: 'desc',
    }),
    [page]
  );

  const cacheKeyString =
    activeTab === 'my-reviews'
      ? `my_reviews_${cacheKey.page}_${cacheKey.size}_${cacheKey.sortBy}_${cacheKey.direction}`
      : `all_all_all_${cacheKey.page}_${cacheKey.size}_${cacheKey.sortBy}_${cacheKey.direction}`;

  const cachedData = cache[cacheKeyString];
  const writtenReviews = useMemo(() => cachedData?.reviews || [], [cachedData]);
  const totalPages =
    cachedData?.pageInfo?.totalPages ??
    Math.ceil((cachedData?.reviews?.length ?? 0) / PAGE_SIZE);

  /** Fetch reviewable products */
  useEffect(() => {
    const fetchReviewable = async () => {
      try {
        if (!isMountedRef.current) return;
        setLoadingReviewable(true);
        const { data, error } = await orderDetailsService.getMyOrderHistory({
          onlyReviewable: true,
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          direction: 'desc',
        });
        if (!isMountedRef.current) return;
        if (error) setErrorReviewable(error);
        else setReviewableProducts(data?.data?.content || []);
      } catch {
        if (!isMountedRef.current) return;
        setErrorReviewable('리뷰 가능한 상품을 불러오지 못했습니다.');
      } finally {
        if (isMountedRef.current) {
          setLoadingReviewable(false);
        }
      }
    };
    fetchReviewable();
  }, []);

  /** Fetch reviews per page */
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (activeTab === 'my-reviews') {
      const params: MyReviewsParams = {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      };
      dispatch(fetchMyReviews(params));
    } else {
      dispatch(fetchReviews(cacheKey));
    }
    dispatch(setHasLoadedOnce(`reviews-page-${activeTab}`));
  }, [dispatch, activeTab, page, cacheKey]);

  /** Background revalidation */
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (activeTab === 'my-reviews' && cachedData) {
      const now = Date.now();
      const isStale = now - cachedData.timestamp >= 10_000;
      if (isStale) {
        const params: MyReviewsParams = {
          page: page - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
        };
        dispatch(revalidateMyReviewsInBackground(params));
      }
    }
  }, [dispatch, activeTab, cachedData, page]);

  /** Check stale */
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (activeTab === 'my-reviews') dispatch(checkStaleStatus());
  }, [dispatch, activeTab, cachedData]);

  const handleWriteReview = (productId: string) => {
    router.push(`/client/pages/my-page/reviews/write?productId=${productId}`);
  };

  const handleViewReview = (reviewId: string) => {
    router.push(`/client/pages/my-page/reviews/view?reviewId=${reviewId}`);
  };

  const shouldShowSkeleton =
    (activeTab === 'my-reviews' && (loading || !hasLoadedOnce)) ||
    (activeTab === 'write' &&
      loadingReviewable &&
      reviewableProducts.length === 0);

  return (
    <div className={styles.container}>
      <ProductHeader />
      <div className={styles.content}>
        {/* Tabs */}
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

        {/* Tab Content with key for clean remount */}
        {shouldShowSkeleton ? (
          <ReviewSkeleton key={`skeleton-${activeTab}`} activeTab={activeTab} />
        ) : (
          <div key={activeTab}>
            {/* Write Tab */}
            {activeTab === 'write' ? (
              <div className={styles.writeReviewSection}>
                <div className={styles.sectionTitle}>
                  쓸 수 있는 리뷰 {reviewableProducts.length}개
                </div>

                {loadingReviewable ? (
                  <div className={styles.emptyState}>로딩 중...</div>
                ) : errorReviewable ? (
                  <div className={styles.emptyState}>
                    오류: {errorReviewable}
                  </div>
                ) : reviewableProducts.length === 0 ? (
                  <div className={styles.emptyState}>
                    아직 리뷰 가능한 상품이 없습니다.
                  </div>
                ) : (
                  <div className={styles.productList}>
                    {reviewableProducts.map((product) => (
                      <div
                        key={`product-${product.orderItemId}`}
                        className={styles.productItem}
                      >
                        <div className={styles.productImage}>
                          <Image
                            src={product.productImageUrl}
                            alt={product.productName}
                            width={70}
                            height={70}
                            className={styles.thumb}
                            unoptimized
                          />
                        </div>
                        <div className={styles.productInfo}>
                          <div className={styles.productName}>
                            {product.productName}
                          </div>
                          <div className={styles.productPrice}>
                            {product.price.toLocaleString('ko-KR')}원
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
              <div className={styles.writeReviewSection}>
                <div className={styles.sectionTitle}>
                  내가 쓴 리뷰 {writtenReviews.length}개
                </div>

                {error ? (
                  <div className={styles.emptyState}>에러: {error}</div>
                ) : writtenReviews.length > 0 ? (
                  <>
                    <div className={styles.productList}>
                      {writtenReviews.map((review) => (
                        <div
                          key={`review-${review.reviewId}`}
                          className={styles.productItem}
                        >
                          <div className={styles.productImage}>
                            <Image
                              src={
                                review.product?.productThumbnail ||
                                review.imageUrls?.[0] ||
                                '/images/icons/product-default.png'
                              }
                              alt={review.productName}
                              width={70}
                              height={70}
                              className={styles.thumb}
                              unoptimized
                            />
                          </div>
                          <div className={styles.productInfo}>
                            <div className={styles.productName}>
                              {review.productName}
                            </div>
                            <div className={styles.productPrice}>
                              {(
                                review.product?.discountedPrice ||
                                review.product?.salePrice ||
                                0
                              ).toLocaleString('ko-KR')}
                              원
                            </div>
                            <div className={styles.productStore}>
                              {(review.product as { storeName?: string })
                                ?.storeName || '-'}
                            </div>
                          </div>
                          <button
                            className={styles.reviewButton}
                            onClick={() => handleViewReview(review.reviewId)}
                          >
                            리뷰보기
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <div style={{ width: 320 }}>
                          <ClientPagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    아직 작성한 리뷰가 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
