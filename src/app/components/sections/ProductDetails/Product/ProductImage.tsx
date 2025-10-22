'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FiMoreHorizontal } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './ProductImage.module.css';
import ReportModal from '@/app/components/ui/modal/ReportModal/ReportModal';
import { ProductDetails } from '@/app/api/types/products/productSummary';

interface ProductImageProps {
  product: ProductDetails;
}

export const ProductImage = ({ product }: ProductImageProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // --- Swipe / drag state
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const deltaXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const SWIPE_THRESHOLD = 50; // px to trigger a slide

  // Resolve images (keep "real" list for indicator)
  const { realImages, displayedImages } = useMemo(() => {
    const raw = Array.isArray(product?.images) ? product.images : [];
    const cleaned = raw.filter(Boolean);
    return {
      realImages: cleaned, // from API
      displayedImages: cleaned.length ? cleaned : ['/images/no-image.png'], // fallback
    };
  }, [product]);

  const totalReal = realImages.length;
  const totalDisplayed = displayedImages.length;

  // Clamp index when images change (no wrap)
  useEffect(() => {
    if (totalDisplayed === 0) return;
    if (currentIndex > totalDisplayed - 1) setCurrentIndex(totalDisplayed - 1);
  }, [totalDisplayed, currentIndex]);

  const currentImage =
    displayedImages[Math.min(currentIndex, totalDisplayed - 1)];

  // Reset image error when current image changes
  useEffect(() => {
    setImageError(false);
  }, [currentImage]);

  // Bounded nav (no wrap)
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalDisplayed - 1;

  const next = () => {
    if (!canGoNext) return;
    setCurrentIndex((i) => Math.min(i + 1, totalDisplayed - 1));
  };

  const prev = () => {
    if (!canGoPrev) return;
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  // --- Touch handlers (mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    deltaXRef.current = 0;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current == null) return;
    deltaXRef.current = e.touches[0].clientX - startXRef.current;
  };

  const onTouchEnd = () => {
    setDragging(false);
    const dx = deltaXRef.current;
    startXRef.current = null;
    deltaXRef.current = 0;

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) next(); // swipe left → next
      else prev(); // swipe right → prev
    }
  };

  // --- Mouse handlers (desktop drag)
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left button only
    startXRef.current = e.clientX;
    deltaXRef.current = 0;
    setDragging(true);
    e.preventDefault(); // block image ghost-drag
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || startXRef.current == null) return;
    deltaXRef.current = e.clientX - startXRef.current;
  };

  const finishMouseDrag = () => {
    if (!dragging) return;
    setDragging(false);
    const dx = deltaXRef.current;
    startXRef.current = null;
    deltaXRef.current = 0;

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) next();
      else prev();
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.imageWrapper}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={finishMouseDrag}
      onMouseLeave={finishMouseDrag}
      style={{
        cursor:
          totalDisplayed > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
        touchAction: 'pan-y',
        userSelect: dragging ? 'none' : 'auto',
      }}
    >
      {/* Product Image */}
      {!imageError ? (
        <Image
          src={currentImage}
          alt={product.productName || 'Product Image'}
          fill
          style={{ objectFit: 'contain', pointerEvents: 'none' }}
          className={styles.image}
          unoptimized={
            typeof currentImage === 'string' &&
            (currentImage.includes('211.107.13.167') ||
              currentImage.startsWith('http'))
          }
          onError={() => {
            // if a real image fails, try to fall back to placeholder for this slide
            if (
              totalDisplayed === 1 &&
              currentImage !== '/images/no-image.png'
            ) {
              setImageError(true);
            } else {
              setImageError(true);
            }
          }}
          priority
        />
      ) : (
        <div className={styles.imageError}>
          <div className={styles.errorContent}>
            <p>이미지를 불러올 수 없습니다</p>
            <button
              onClick={() => setImageError(false)}
              className={styles.retryButton}
              type="button"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* Nav arrows (show only if multiple images) */}
      {totalDisplayed > 1 && (
        <>
          <button
            className={`${styles.navLeft} ${
              !canGoPrev ? styles.navDisabled : ''
            }`}
            onClick={prev}
            aria-label="Previous image"
            type="button"
            disabled={!canGoPrev}
          >
            <FaChevronLeft size={20} />
          </button>

          <button
            className={`${styles.navRight} ${
              !canGoNext ? styles.navDisabled : ''
            }`}
            onClick={next}
            aria-label="Next image"
            type="button"
            disabled={!canGoNext}
          >
            <FaChevronRight size={20} />
          </button>
        </>
      )}

      {/* Three-dot menu */}
      <div className={styles.menuWrapper}>
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Open image menu"
          type="button"
        >
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.dropdown} role="menu">
          <button
            onClick={() => {
              setMenuOpen(false);
              setReportOpen(true);
            }}
            className={styles.onReportButton}
            role="menuitem"
            type="button"
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

      {/* Index indicator (use actual API total; 0/0 when none) */}
      <div className={styles.indexIndicator}>
        {totalReal > 0 ? `${currentIndex + 1}/${totalReal}` : '0/0'}
      </div>
    </div>
  );
};
