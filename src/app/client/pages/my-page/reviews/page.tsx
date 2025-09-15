'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaStar } from 'react-icons/fa';
import styles from './Reviews.module.css';

// Mock data for products available for review
const mockProducts = [
  {
    id: 1,
    name: '탐사 강아지 고구마말랭이 간식',
    price: 11000,
    store: '○○ 동물병원',
    image: '/images/products/dog-snack.png'
  },
  {
    id: 2,
    name: '굿데이 건강한 육포 강아지 간식',
    price: 12560,
    store: '펫프렌즈',
    image: '/images/products/dog-snack2.png'
  },
  {
    id: 3,
    name: '씨엔앨 고양이 짜먹는 간식',
    price: 24000,
    store: '강아지대통령',
    image: '/images/products/dogfood.png'
  },
  {
    id: 4,
    name: '압축 톱밥 베딩 사과향, 15L, 2개',
    price: 59900,
    store: 'ㄱㄱ 동물 클리닉',
    image: '/images/products/dog-snack.png'
  },
  {
    id: 5,
    name: '종합 8종 버라이어티 화식사료, 50g, 28개',
    price: 9800,
    store: '인터파크 펫',
    image: '/images/products/dog-snack2.png'
  },
  {
    id: 6,
    name: '고흡수 든든패드 레몬향',
    price: 85000,
    store: '어바웃펫',
    image: '/images/products/dogfood.png'
  },
  {
    id: 7,
    name: '더리얼 강아지 레시피 단치킨 케이크',
    price: 85000,
    store: '어바웃펫',
    image: '/images/products/dog-snack.png'
  },
  {
    id: 8,
    name: '참좋은간식 애견보양식 파우치',
    price: 85000,
    store: '어바웃펫',
    image: '/images/products/dog-snack2.png'
  }
];

// Mock data for written reviews
const mockWrittenReviews = [
  {
    id: 1,
    productName: '탐사 강아지 고구마말랭이 간식',
    rating: 5,
    reviewText: '우리 강아지가 너무 잘 먹어요! 고구마 말랭이라 건강에도 좋고, 말랑해서 먹기도 편해 보여요.',
    date: '2025.08.10',
    image: '/images/products/dog-snack.png'
  }
];

export default function ReviewsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'write' | 'my-reviews'>('write');

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleWriteReview = (productId: number) => {
    router.push(`/client/pages/my-page/reviews/write?productId=${productId}`);
  };

  const handleViewReview = (reviewId: number) => {
    router.push(`/client/pages/my-page/reviews/view?reviewId=${reviewId}`);
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
            className={`${styles.tab} ${activeTab === 'write' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('write')}
          >
            리뷰 쓰기
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'my-reviews' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('my-reviews')}
          >
            내가 쓴 리뷰
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'write' ? (
          <div className={styles.writeReviewSection}>
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
                    <div className={styles.productPrice}>{formatPrice(product.price)}</div>
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
          <div className={styles.myReviewsSection}>
            <div className={styles.sectionTitle}>
              등록한 리뷰 {mockWrittenReviews.length}개
            </div>
            
            {mockWrittenReviews.length > 0 ? (
              <div className={styles.reviewsList}>
                {mockWrittenReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className={styles.reviewItem}
                    onClick={() => handleViewReview(review.id)}
                  >
                    <div className={styles.reviewImage}>
                      <img src={review.image} alt={review.productName} />
                    </div>
                    
                    <div className={styles.reviewContent}>
                      <div className={styles.reviewProductName}>{review.productName}</div>
                      <div className={styles.reviewRating}>
                        {renderStars(review.rating)}
                      </div>
                      <div className={styles.reviewDate}>{review.date}</div>
                      <div className={styles.reviewPreview}>
                        {review.reviewText.length > 50 
                          ? `${review.reviewText.substring(0, 50)}...` 
                          : review.reviewText}
                      </div>
                    </div>
                    
                    <button className={styles.viewButton}>
                      보기
                    </button>
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
