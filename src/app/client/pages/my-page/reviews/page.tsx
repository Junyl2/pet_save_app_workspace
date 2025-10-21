'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaStar } from 'react-icons/fa';
import ReviewSkeleton from '@/app/components/ui/SkeletonLoading/ReviewSkeleton/ReviewSkeleton';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import {
  fetchReviews,
  fetchMyReviews,
  ReviewCacheKey,
} from '@/app/redux/slices/cache/reviewSlice';
/* import { Review } from '@/app/api/types/member/review/review'; */
import styles from './Reviews.module.css';

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

// Mock data for products available for review
const mockProducts = [
  {
    id: 1,
    name: '탐사 강아지 고구마말랭이 간식',
    price: 11000,
    store: '○○ 동물병원',
    image: '/images/products/dog-snack.png',
  },
  {
    id: 2,
    name: '굿데이 건강한 육포 강아지 간식',
    price: 12560,
    store: '펫프렌즈',
    image: '/images/products/dog-snack2.png',
  },
  {
    id: 3,
    name: '씨엔앨 고양이 짜먹는 간식',
    price: 24000,
    store: '강아지대통령',
    image: '/images/products/dogfood.png',
  },
  {
    id: 4,
    name: '압축 톱밥 베딩 사과향, 15L, 2개',
    price: 59900,
    store: 'ㄱㄱ 동물 클리닉',
    image: '/images/products/dog-snack.png',
  },
  {
    id: 5,
    name: '종합 8종 버라이어티 화식사료, 50g, 28개',
    price: 9800,
    store: '인터파크 펫',
    image: '/images/products/dog-snack2.png',
  },
  {
    id: 6,
    name: '고흡수 든든패드 레몬향',
    price: 85000,
    store: '어바웃펫',
    image: '/images/products/dogfood.png',
  },
  {
    id: 7,
    name: '더리얼 강아지 레시피 단치킨 케이크',
    price: 85000,
    store: '어바웃펫',
    image: '/images/products/dog-snack.png',
  },
  {
    id: 8,
    name: '참좋은간식 애견보양식 파우치',
    price: 85000,
    store: '어바웃펫',
    image: '/images/products/dog-snack2.png',
  },
];

export default function ReviewsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'write' | 'my-reviews'>('write');

  // Redux state
  const { cache, loading, error } = useAppSelector((state) => state.reviews);

  // Get current cache key for reviews
  const getCurrentCacheKey = (): string => {
    if (activeTab === 'my-reviews') {
      return `my_reviews_0_50_createdAt_desc`;
    }
    return `all_all_all_0_50_createdAt_desc`;
  };

  // Get current reviews from cache
  const currentCacheKeyString = getCurrentCacheKey();
  const cachedData = cache[currentCacheKeyString];
  const writtenReviews = cachedData?.reviews || [];

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleWriteReview = (productId: number) => {
    router.push(`/client/pages/my-page/reviews/write?productId=${productId}`);
  };

  const handleEditReview = (reviewId: string) => {
    router.push(`/client/pages/my-page/reviews/edit?reviewId=${reviewId}`);
  };

  // Fetch reviews using Redux
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
  }, [dispatch, activeTab]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index} // fixed-length static list; safe
        className={`${styles.star} ${
          index < rating ? styles.starFilled : styles.starEmpty
        }`}
      />
    ));
  };

  // Show loading only if we don't have cached data and are loading
  const shouldShowLoading =
    loading && !cachedData && activeTab === 'my-reviews';
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

        {/* Content based on active tab */}
        {activeTab === 'write' ? (
          <div key="write-tab" className={styles.writeReviewSection}>
            <div className={styles.sectionTitle}>
              쓸 수 있는 리뷰 {mockProducts.length}개
            </div>

            <div className={styles.productList}>
              {mockProducts.map((product) => (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productImage}>
                    <img src={product.image} alt={product.name} />
                  </div>

                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productPrice}>
                      {formatPrice(product.price)}
                    </div>
                    <div className={styles.productStore}>{product.store}</div>
                  </div>

                  <button
                    className={styles.reviewButton}
                    onClick={() => handleWriteReview(product.id)}
                  >
                    리뷰쓰기
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div key="my-reviews-tab" className={styles.myReviewsSection}>
            {error ? (
              <div className={styles.emptyState}>에러: {error}</div>
            ) : writtenReviews.length > 0 ? (
              <div className={styles.detailedReviewContainer}>
                {writtenReviews.map((review) => (
                  <div key={review.reviewId} className={styles.detailedReview}>
                    {/* Review Header */}
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
                        onClick={() => handleEditReview(review.reviewId)}
                      >
                        수정하기
                      </button>
                    </div>

                    {/* Product Name */}
                    <div className={styles.reviewProductName}>
                      {review.productName}
                    </div>

                    {/* Review Images (stable keys) */}
                    {review.imageUrls && review.imageUrls.length > 0 && (
                      <div className={styles.reviewImagesContainer}>
                        {review.imageUrls.map((image, imageIndex) => (
                          <div
                            key={`${review.reviewId}-image-${imageIndex}`}
                            className={styles.reviewImageItem}
                          >
                            <img src={image} alt="Review image" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Review Text */}
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
