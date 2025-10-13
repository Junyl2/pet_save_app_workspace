'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FiMoreHorizontal } from 'react-icons/fi';
import styles from './ProductImage.module.css';
import ReportModal from '@/app/components/ui/modal/ReportModal/ReportModal';
import { ProductSummary } from '@/app/api/types/products/productSummary';

interface ProductImageProps {
  src: string;
  alt: string;
  currentIndex?: number;
  totalCount?: number;
  product?: ProductSummary;
}

export const ProductImage = ({
  src,
  alt,
  currentIndex = 1,
  totalCount = 1,
  product,
}: ProductImageProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className={styles.imageWrapper}>
      {/* Product Image */}
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'contain' }}
        className={styles.image}
      />

      {/* Horizontal three-dot menu */}
      <div className={styles.menuWrapper}>
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.dropdown}>
          <button
            onClick={() => {
              setMenuOpen(false);
              setReportOpen(true);
            }}
            className={styles.onReportButton}
          >
            신고하기
          </button>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        show={reportOpen}
        onClose={() => setReportOpen(false)}
        product={product}
      />

      {/* Image index indicator */}
      <div className={styles.indexIndicator}>
        {currentIndex}/{totalCount}
      </div>
    </div>
  );
};
