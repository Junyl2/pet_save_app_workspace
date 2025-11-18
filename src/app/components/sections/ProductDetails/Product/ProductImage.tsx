'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiMoreHorizontal,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import styles from './ProductImage.module.css';
import ReportModal from '@/app/components/ui/modal/ReportModal/ReportModal';
import {
  ProductDetails,
  ProductDetailsResponse,
  ProductSummary,
} from '@/app/api/types/products/productSummary';

interface ProductImageProps {
  productId?: string;
  src?: string;
  alt: string;
  product?: ProductSummary | ProductDetails;
}

export const ProductImage = ({
  productId,
  src,
  alt,
  product: initialProduct,
}: ProductImageProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [product, setProduct] = useState<
    ProductDetails | ProductSummary | null
  >(initialProduct ?? null);

  const [images, setImages] = useState<string[]>(
    (initialProduct &&
    'images' in initialProduct &&
    initialProduct.images?.length
      ? initialProduct.images
      : []) || (src ? [src] : [])
  );

  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);

  const totalImages = images.length || 1;

  const displaySrc = useMemo(
    () => images[index] ?? src ?? '/images/placeholder.png',
    [images, index, src]
  );

  // Fetch product if needed
  useEffect(() => {
    if (initialProduct) return;
    if (!productId) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/pet-save/products/${productId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ProductDetailsResponse;
        if (cancelled) return;
        const data = json.data;

        setProduct(data);
        setImages(data?.images?.length ? data.images : src ? [src] : []);
        setIndex(0);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId, initialProduct, src]);

  // Swipe & drag
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const threshold = 50;

  const goNext = () => {
    if (index < totalImages - 1) setIndex((i) => i + 1);
  };
  const goPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || startX.current === null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(delta) > threshold) delta < 0 ? goNext() : goPrev();
    isDragging.current = false;
    startX.current = null;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    isDragging.current = true;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || startX.current === null) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > threshold) delta < 0 ? goNext() : goPrev();
    isDragging.current = false;
    startX.current = null;
  };

  return (
    <div
      className={styles.imageWrapper}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {/* Real img tag replacement */}
      <img src={displaySrc} alt={alt} className={styles.image} />

      {index > 0 && (
        <button className={styles.navLeft} onClick={goPrev}>
          <FiChevronLeft size={22} />
        </button>
      )}
      {index < totalImages - 1 && (
        <button className={styles.navRight} onClick={goNext}>
          <FiChevronRight size={22} />
        </button>
      )}

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

      <ReportModal
        show={reportOpen}
        onClose={() => setReportOpen(false)}
        product={product ?? undefined}
      />

      <div className={styles.indexIndicator}>
        {index + 1}/{totalImages}
      </div>

      {loading && <div className={styles.loadingOverlay}>Loading…</div>}
    </div>
  );
};
