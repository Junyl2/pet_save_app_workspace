'use client';
import styles from './ProductSkeleton.module.css';

interface SkeletonListProps {
  count?: number;
}

export default function ProductSkeleton({ count = 5 }: SkeletonListProps) {
  return (
    <>
      <div className={styles.divider}></div>
      <div className={styles.container}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.imageWrapper}>
              <div className={styles.imageSkeleton}></div>
            </div>
            <div className={styles.content}>
              <div className={styles.header}>
                <div className={styles.nameSkeleton}></div>
                <div className={styles.iconsSkeleton}>
                  <div className={styles.iconSkeleton}></div>
                  <div className={styles.iconSkeleton}></div>
                </div>
              </div>
              <div className={styles.detailSkeleton}></div>
              <div className={styles.priceSkeleton}></div>
              <div className={styles.infoSkeleton}></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
