'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './CategorySkeleton.module.css';

type CategorySkeletonProps = {
  /** How many pill placeholders to render */
  count?: number;
  /** Force seller-details styling (otherwise auto-detects from pathname) */
  isSellerDetails?: boolean;
};

export default function CategorySkeleton({
  count = 8,
  isSellerDetails,
}: CategorySkeletonProps) {
  const pathname = usePathname();
  const seller =
    typeof isSellerDetails === 'boolean'
      ? isSellerDetails
      : pathname.startsWith('/client/pages/seller-details');

  const pillWidths = [72, 96, 84, 110, 90, 80, 100, 88];

  return (
    <div className={seller ? styles.sellerNav : styles.wrapper} aria-hidden>
      <div className={seller ? styles.sellerContainer : styles.container}>
        {/* Filter button placeholder */}
        <div className={`${styles.filter} ${styles.skeleton}`} />

        {/* Category pill placeholders */}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${styles.item} ${styles.skeleton}`}
            style={{ width: pillWidths[i % pillWidths.length] }}
          />
        ))}
      </div>
    </div>
  );
}
