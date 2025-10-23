'use client';

import React from 'react';
import styles from './NearbySkeleton.module.css';

type NearbySkeletonProps = {
  /** How many skeleton rows to render */
  count?: number;
};

export default function NearbySkeleton({ count = 3 }: NearbySkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {items.map((_, i) => (
          <div key={i} className={styles.card}>
            {/* Phone icon area */}
            <button className={styles.phoneButton} aria-hidden>
              <div className={`${styles.iconSkeleton} ${styles.skeleton}`} />
            </button>

            {/* Thumbnail */}
            <div className={styles.imageWrapper}>
              <div className={`${styles.imageSkeleton} ${styles.skeleton}`} />
            </div>

            {/* Text blocks */}
            <div className={styles.content}>
              <div className={styles.header}>
                <div className={`${styles.nameSkeleton} ${styles.skeleton}`} />
              </div>

              <div className={`${styles.detailSkeleton} ${styles.skeleton}`} />

              <div className={styles.infoRow}>
                <div className={`${styles.infoSkeleton} ${styles.skeleton}`} />
                <div
                  className={`${styles.distanceSkeleton} ${styles.skeleton}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divider to match page background spacing (optional) */}
      <div className={styles.divider} />
    </div>
  );
}
