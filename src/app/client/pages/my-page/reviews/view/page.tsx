'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaStar, FaEllipsisV } from 'react-icons/fa';
import styles from './ViewReview.module.css';
import Portal from '@/app/components/system/Portal';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';
import { Review } from '@/app/api/types/member/review/review';
import Loading from '@/app/components/ui/Loading/Loading';

export default function ViewReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reviewId = searchParams.get('reviewId');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch review data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchReview = async () => {
      if (!reviewId) {
        setError('리뷰 ID가 필요합니다.');
        setLoading(false);
        return;
      }

      try {
        // Since there's no direct API to get a single review by ID,
        // we'll search for reviews and find the specific one
        // In a real implementation, you might want to add a userId filter
        const response = await ReviewService.searchReviews({
          page: 0,
          size: 100, // Get more reviews to find the specific one
        });

        if (!isMounted) return;

        if (response.error) {
          setError('리뷰를 불러올 수 없습니다.');
        } else if (response.data?.content) {
          const foundReview = response.data.content.find(
            (r) => r.reviewId === reviewId
          );
          if (foundReview) {
            setReview(foundReview);
          } else {
            setError('리뷰를 찾을 수 없습니다.');
          }
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
  }, [reviewId]);

  const handleOptionsClick = () => setShowOptionsMenu((s) => !s);

  const handleEditReview = () => {
    setShowOptionsMenu(false);
    router.push(`/client/pages/my-page/reviews/edit?reviewId=${reviewId}`);
  };

  const handleDeleteReview = () => {
    setShowOptionsMenu(false);
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      router.push('/client/pages/my-page/reviews');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index} // static 1..5
        className={`${styles.star} ${
          index < rating ? styles.starFilled : styles.starEmpty
        }`}
      />
    ));
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
                <div className={styles.username}>{review.reviewer.name}</div>
                <div className={styles.userIdAndDate}>
                  {review.reviewer.memberId} |{' '}
                  {new Date(review.createdAt)
                    .toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                    .replace(/\./g, '.')
                    .replace(/\s/g, '')}
                </div>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.optionsButton}
                onClick={handleOptionsClick}
                aria-haspopup="menu"
                aria-expanded={showOptionsMenu}
              >
                <FaEllipsisV />
              </button>
            </div>
          </div>

          {/* Star Rating */}
          <div className={styles.ratingContainer}>
            <div className={styles.stars}>{renderStars(review.rating)}</div>
          </div>

          {/* Product Name */}
          <div className={styles.productName}>{review.product.productName}</div>

          {/* Review Images (stable keys) */}
          {review.imageUrls && review.imageUrls.length > 0 && (
            <div className={styles.imagesContainer}>
              {review.imageUrls.map((imageUrl, index) => (
                <div key={index} className={styles.reviewImage}>
                  <img src={imageUrl} alt="Review image" />
                </div>
              ))}
            </div>
          )}

          {/* Review Text */}
          <div className={styles.reviewText}>{review.content}</div>
        </div>
      </div>

      {/* Menu + overlay rendered in a body-level portal */}
      {showOptionsMenu && (
        <Portal>
          <div className={styles.optionsPortalWrap}>
            <div className={styles.optionsMenu} role="menu">
              <button className={styles.optionItem} onClick={handleEditReview}>
                수정하기
              </button>
              <button
                className={styles.optionItem}
                onClick={handleDeleteReview}
              >
                삭제하기
              </button>
            </div>
            <div
              className={styles.overlay}
              onClick={() => setShowOptionsMenu(false)}
              aria-hidden="true"
            />
          </div>
        </Portal>
      )}
    </div>
  );
}
