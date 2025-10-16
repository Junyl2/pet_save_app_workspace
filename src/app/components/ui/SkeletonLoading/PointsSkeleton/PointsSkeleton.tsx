import React from 'react';
import styles from './PointsSkeleton.module.css';

export default function PointsSkeleton() {
  return (
    <div className={styles.container}>
      {/* Current Points Section Skeleton */}
      <div className={styles.pointsSection}>
        <div className={styles.sectionTitleSkeleton}></div>

        <div className={styles.currentPoints}>
          <div className={styles.pointIconWrap}>
            <div className={styles.pointIconSkeleton}></div>
          </div>
          <div className={styles.pointAmountSkeleton}></div>
        </div>

        {/* Points Usage Info Button Skeleton */}
        <div className={styles.pointsInfoButtonSkeleton}></div>
      </div>

      <div className={styles.divider}></div>

      {/* Points History Section Skeleton */}
      <div className={styles.historyHeader}>
        <div className={styles.historyTitleSkeleton}></div>
        <div className={styles.viewAllButtonSkeleton}></div>
      </div>

      <div className={styles.historySection}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={styles.historyItem}>
            <div className={styles.historyLeft}>
              <div className={styles.historyDateSkeleton}></div>
              <div className={styles.historyDescriptionSkeleton}></div>
              <div className={styles.historySubtitleSkeleton}></div>
            </div>
            <div className={styles.historyRight}>
              <div className={styles.historyAmountSkeleton}></div>
              <div className={styles.expiryDateSkeleton}></div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.divider}></div>

      {/* Rewards Section Skeleton */}
      <div className={styles.rewardsHeader}>
        <div className={styles.rewardsTitleSkeleton}></div>
      </div>

      <div className={styles.rewardsSubHeader}>
        <div className={styles.rewardsSubTitleSkeleton}></div>
        <div className={styles.rewardsCountSkeleton}></div>
        <div className={styles.viewAllButtonSkeleton}></div>
      </div>

      <div className={styles.rewardsSection}>
        <div className={styles.productList}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={styles.productItem}>
              <div className={styles.productImageSkeleton}></div>
              <div className={styles.productInfo}>
                <div className={styles.productNameSkeleton}></div>
                <div className={styles.productPriceSkeleton}></div>
                <div className={styles.productBrandSkeleton}></div>
              </div>
              <div className={styles.reviewButtonSkeleton}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
