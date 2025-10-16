import React from 'react';
import styles from './ReviewSkeleton.module.css';

interface ReviewSkeletonProps {
  activeTab?: 'write' | 'my-reviews';
}

export default function ReviewSkeleton({
  activeTab = 'write',
}: ReviewSkeletonProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Tab Navigation Skeleton */}
        <div className={styles.tabContainer}>
          <div
            className={`${styles.tabSkeleton} ${
              activeTab === 'write' ? styles.activeTabSkeleton : ''
            }`}
          ></div>
          <div
            className={`${styles.tabSkeleton} ${
              activeTab === 'my-reviews' ? styles.activeTabSkeleton : ''
            }`}
          ></div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'write' ? (
          <div className={styles.writeReviewSection}>
            {/* Section Title Skeleton */}
            <div className={styles.sectionTitleSkeleton}></div>

            {/* Product List Skeleton */}
            <div className={styles.productList}>
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className={styles.productItem}>
                  <div className={styles.productImageSkeleton}></div>

                  <div className={styles.productInfo}>
                    <div className={styles.productNameSkeleton}></div>
                    <div className={styles.productPriceSkeleton}></div>
                    <div className={styles.productStoreSkeleton}></div>
                  </div>

                  <div className={styles.reviewButtonSkeleton}></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.myReviewsSection}>
            {/* Review Item Skeleton */}
            <div className={styles.detailedReviewContainer}>
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className={styles.detailedReview}>
                  {/* Review Header Skeleton */}
                  <div className={styles.reviewHeader}>
                    <div className={styles.userInfo}>
                      <div className={styles.profileImageSkeleton}></div>
                      <div className={styles.userDetails}>
                        <div className={styles.usernameAndRating}>
                          <div className={styles.usernameSkeleton}></div>
                          <div className={styles.starsContainer}>
                            {Array.from({ length: 5 }, (_, starIndex) => (
                              <div
                                key={starIndex}
                                className={styles.starSkeleton}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div className={styles.userIdAndDateSkeleton}></div>
                      </div>
                    </div>

                    <div className={styles.editButtonSkeleton}></div>
                  </div>

                  {/* Product Name Skeleton */}
                  <div className={styles.reviewProductNameSkeleton}></div>

                  {/* Review Images Skeleton */}
                  <div className={styles.reviewImagesContainer}>
                    {Array.from({ length: 3 }, (_, imageIndex) => (
                      <div
                        key={imageIndex}
                        className={styles.reviewImageItemSkeleton}
                      ></div>
                    ))}
                  </div>

                  {/* Review Text Skeleton */}
                  <div className={styles.reviewTextContent}>
                    <div className={styles.reviewTextLineSkeleton}></div>
                    <div className={styles.reviewTextLineSkeleton}></div>
                    <div className={styles.reviewTextLineSkeleton}></div>
                    <div className={styles.reviewTextLineShortSkeleton}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
