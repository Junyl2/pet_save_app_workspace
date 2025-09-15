'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaStar, FaEllipsisV } from 'react-icons/fa';
import styles from './ViewReview.module.css';

// Mock review data
const mockReviews = [
  {
    id: 1,
    productName: '탐사 강아지 고구마말랭이 간식',
    rating: 5,
    reviewText: '우리 강아지가 너무 잘 먹어요! 고구마 말랭이라 건강에도 좋고, 말랑해서 먹기도 편해 보여요. 간식 줄 때마다 꼬리를 흔들며 좋아하네요. 재구매 의사 100%입니다!',
    images: [
      '/images/products/dog-snack.png',
      '/images/products/dog-snack2.png',
      '/images/products/dogfood.png'
    ],
    username: '만족해요',
    userId: 'petsave100000',
    date: '2025.08.10',
    profileImage: '/images/icons/apple.png'
  }
];

export default function ViewReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reviewId = searchParams.get('reviewId');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  // Find review by ID (default to first review if not found)
  const review = mockReviews.find(r => r.id.toString() === reviewId) || mockReviews[0];

  const handleOptionsClick = () => {
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleEditReview = () => {
    setShowOptionsMenu(false);
    router.push(`/client/pages/my-page/reviews/edit?reviewId=${reviewId}`);
  };

  const handleDeleteReview = () => {
    setShowOptionsMenu(false);
    // TODO: Show delete confirmation modal
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      console.log('Delete review:', review.id);
      // Navigate back to reviews list after deletion
      router.push('/client/pages/my-page/reviews');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`${styles.star} ${index < rating ? styles.starFilled : styles.starEmpty}`}
      />
    ));
  };

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
                <img src={review.profileImage} alt="Profile" />
              </div>
              <div className={styles.userDetails}>
                <div className={styles.username}>{review.username}</div>
                <div className={styles.userIdAndDate}>
                  {review.userId} | {review.date}
                </div>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                className={styles.optionsButton}
                onClick={handleOptionsClick}
              >
                <FaEllipsisV />
              </button>
              
              {/* Options Menu */}
              {showOptionsMenu && (
                <div className={styles.optionsMenu}>
                  <button 
                    className={styles.optionItem}
                    onClick={handleEditReview}
                  >
                    수정하기
                  </button>
                  <button 
                    className={styles.optionItem}
                    onClick={handleDeleteReview}
                  >
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Star Rating */}
          <div className={styles.ratingContainer}>
            <div className={styles.stars}>
              {renderStars(review.rating)}
            </div>
          </div>

          {/* Product Name */}
          <div className={styles.productName}>
            {review.productName}
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className={styles.imagesContainer}>
              {review.images.map((image, index) => (
                <div key={index} className={styles.reviewImage}>
                  <img src={image} alt={`Review image ${index + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Review Text */}
          <div className={styles.reviewText}>
            {review.reviewText}
          </div>
        </div>
      </div>

      {/* Overlay to close options menu */}
      {showOptionsMenu && (
        <div 
          className={styles.overlay}
          onClick={() => setShowOptionsMenu(false)}
        />
      )}
    </div>
  );
}
