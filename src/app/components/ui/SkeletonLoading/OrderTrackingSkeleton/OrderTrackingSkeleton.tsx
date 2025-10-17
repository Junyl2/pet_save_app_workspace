import React from 'react';
import styles from './OrderTrackingSkeleton.module.css';

export default function OrderTrackingSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className={styles.dateRangeSkeleton}></div>
        <div className={styles.orderNumberSkeleton}></div>
      </div>

      {/* Progress Section Skeleton */}
      <div className={styles.progressSection}>
        <div className={styles.progressTitleSkeleton}></div>

        <div className={styles.progressContainer}>
          {/* Progress Line Skeleton */}
          <div className={styles.progressTrack}>
            <div className={styles.progressFillSkeleton}></div>
          </div>

          {/* Steps Skeleton */}
          <div className={styles.stepsList}>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className={styles.stepItem}>
                <div className={styles.stepDotSkeleton}></div>
                <div className={styles.stepLabelSkeleton}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Section Skeleton */}
      <div className={styles.productSection}>
        <div className={styles.productContent}>
          <div className={styles.productImageSkeleton}></div>
          <div className={styles.productDetails}>
            <div className={styles.productNameSkeleton}></div>
            <div className={styles.productBrandSkeleton}></div>
            <div className={styles.productPricing}>
              <div className={styles.originalPriceSkeleton}></div>
              <div className={styles.currentPriceSkeleton}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Timeline Skeleton */}
      <div className={styles.timelineSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleSkeleton}></div>
        </div>

        <div className={styles.timelineContent}>
          <div className={styles.timelineList}>
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.eventTime}>
                  <div className={styles.eventDateSkeleton}></div>
                  <div className={styles.eventTimeStampSkeleton}></div>
                </div>
                <div className={styles.eventDetails}>
                  <div className={styles.eventStatusSkeleton}></div>
                  <div className={styles.eventDescriptionSkeleton}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Info Skeleton */}
      <div className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleSkeleton}></div>
        </div>

        <div className={styles.infoContent}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabelSkeleton}></div>
            <div className={styles.infoValueSkeleton}></div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabelSkeleton}></div>
            <div className={styles.infoValueSkeleton}></div>
          </div>
        </div>
      </div>

      {/* Delivery Info Skeleton */}
      <div className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleSkeleton}></div>
        </div>

        <div className={styles.infoContent}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabelSkeleton}></div>
            <div className={styles.infoValueSkeleton}></div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabelSkeleton}></div>
            <div className={styles.infoValueAddressSkeleton}></div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabelSkeleton}></div>
            <div className={styles.infoValueSkeleton}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
