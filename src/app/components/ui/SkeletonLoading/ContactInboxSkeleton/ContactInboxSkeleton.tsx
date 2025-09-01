'use client';
import styles from './ContactInboxSkeleton.module.css';
import { FaChevronDown } from 'react-icons/fa';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';

interface SkeletonProps {
  count?: number;
}

export default function ContactInboxSkeleton({ count = 6 }: SkeletonProps) {
  return (
    <>
      <ProductHeader />
      {/* Dropdown container */}
      <div className={styles.dropdownContainer}>
        <button className={styles.dropdownToggle}>
          <span className={styles.dropdownLabel}> 1개월</span>

          <FaChevronDown className={styles.dropdownArrow} />
        </button>
      </div>
      <div className={styles.container}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.row}>
              <div className={styles.statusSkeleton}></div>
              <div className={styles.dateSkeleton}></div>
            </div>
            <div className={styles.row}>
              <div className={styles.hospitalSkeleton}></div>
              <div className={styles.categorySkeleton}></div>
            </div>
            <div className={styles.messageSkeleton}></div>
          </div>
        ))}
      </div>
    </>
  );
}
