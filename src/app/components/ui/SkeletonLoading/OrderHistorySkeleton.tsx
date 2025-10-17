import React from 'react';
import styles from './OrderHistorySkeleton.module.css';

interface OrderHistorySkeletonProps {
  count?: number;
}

export default function OrderHistorySkeleton({
  count = 3,
}: OrderHistorySkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.card}>
          {/* Header skeleton */}
          <div className={styles.header}>
            <div className={styles.statusSkeleton}></div>
            <div className={styles.detailButtonSkeleton}></div>
          </div>

          {/* Body skeleton */}
          <div className={styles.body}>
            <div className={styles.imageWrapper}>
              <div className={styles.imageSkeleton}></div>
            </div>

            <div className={styles.details}>
              <div className={styles.orderNumberSkeleton}></div>
              <div className={styles.nameSkeleton}></div>
              <div className={styles.brandSkeleton}></div>
              <div className={styles.priceSkeleton}></div>
              <div className={styles.dateSkeleton}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
