'use client';
import styles from './ContactInboxSkeleton.module.css';
import TopBar from '@/app/components/sections/TopBar/TopBar';

interface SkeletonProps {
  count?: number;
}

export default function ContactInboxSkeleton({ count = 6 }: SkeletonProps) {
  return (
    <>
      <TopBar />
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
