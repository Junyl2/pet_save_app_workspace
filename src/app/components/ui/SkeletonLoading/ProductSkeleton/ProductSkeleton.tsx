'use client';
import { useEffect, useState } from 'react';
import styles from './ProductSkeleton.module.css';

interface SkeletonListProps {
  count?: number;
}

export default function ProductSkeleton({ count }: SkeletonListProps) {
  const [skeletonCount, setSkeletonCount] = useState(5);

  useEffect(() => {
    const updateSkeletonCount = () => {
      // Check if we're on tablet (768px-1024px)
      if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
        // Always show 6 items on tablet for 2-column layout
        setSkeletonCount(6);
      } else {
        // Use custom count or default to 5 for mobile/desktop
        setSkeletonCount(count || 5);
      }
    };

    // Set initial count
    updateSkeletonCount();

    // Listen for resize events
    window.addEventListener('resize', updateSkeletonCount);
    return () => window.removeEventListener('resize', updateSkeletonCount);
  }, [count]);

  return (
    <>
      <div className={styles.divider}></div>
      <div className={styles.container}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
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
