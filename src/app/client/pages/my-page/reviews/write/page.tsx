'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaStar, FaCamera } from 'react-icons/fa';
import styles from './WriteReview.module.css';

// Mock product data - in real app, this would come from API
const mockProducts = [
  {
    id: 1,
    name: '탐사 강아지 고구마말랭이 간식',
    store: '○○ 동물병원',
    purchaseDate: '25.07.30',
    image: '/images/products/dog-snack.png',
  },
  {
    id: 2,
    name: '굿데이 건강한 육포 강아지 간식',
    store: '펫프렌즈',
    purchaseDate: '25.07.28',
    image: '/images/products/dog-snack2.png',
  },
  {
    id: 3,
    name: '씨엔앨 고양이 짜먹는 간식',
    store: '강아지대통령',
    purchaseDate: '25.07.25',
    image: '/images/products/dogfood.png',
  },
];

type NewImage = { id: string; file: File; url: string };

export default function WriteReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find product by ID (default to first product if not found)
  const product =
    mockProducts.find((p) => p.id.toString() === productId) || mockProducts[0];

  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [attachedImages, setAttachedImages] = useState<NewImage[]>([]);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  const handleStarClick = (starIndex: number) => setRating(starIndex);
  const handleStarHover = (starIndex: number) => setHoveredStar(starIndex);
  const handleStarLeave = () => setHoveredStar(0);

  const handlePhotoUpload = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const additions: NewImage[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
    }));
    setAttachedImages((prev) => [...prev, ...additions]);
  };

  const removeImage = (id: string) => {
    setAttachedImages((prev) => {
      const img = prev.find((x) => x.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  // cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      attachedImages.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, [attachedImages]);

  const handleSubmit = () => {
    if (rating > 0 && reviewText.trim()) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        router.push('/client/pages/my-page/reviews');
      }, 3000);
    }
  };

  const isFormValid = rating > 0 && reviewText.trim().length > 0;

  return (
    <div className={styles.container}>
      <ProductHeader />

      <div className={styles.content}>
        {/* Product Info */}
        <div className={styles.productSection}>
          <div className={styles.productImage}>
            <img src={product.image} alt={product.name} />
          </div>
          <div className={styles.productInfo}>
            <div className={styles.productName}>{product.name}</div>
            <div className={styles.productStore}>{product.store}</div>
            <div className={styles.purchaseDate}>
              {product.purchaseDate} 주문
            </div>
          </div>
        </div>
        <div className={styles.divider}></div>

        {/* Rating Section */}
        <div className={styles.ratingSection}>
          <div className={styles.ratingTitle}>
            구매하신 상품은 만족하시나요?
          </div>
          <div className={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <button
                key={starIndex} // static 1..5
                className={styles.starButton}
                onClick={() => handleStarClick(starIndex)}
                onMouseEnter={() => handleStarHover(starIndex)}
                onMouseLeave={handleStarLeave}
              >
                <FaStar
                  className={`${styles.star} ${
                    starIndex <= (hoveredStar || rating)
                      ? styles.starFilled
                      : styles.starEmpty
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div className={styles.divider}></div>

        {/* Review Text Section */}
        <div className={styles.reviewSection}>
          <div className={styles.reviewTitle}>자세한 리뷰를 작성해주세요</div>
          <textarea
            className={styles.reviewTextarea}
            placeholder="상품에 대한 경험을 적어주세요"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
          />
          <div className={styles.charCount}>{reviewText.length}/500</div>
        </div>

        {/* Photo Upload Section */}
        <div className={styles.photoSection}>
          <button className={styles.photoButton} onClick={handlePhotoUpload}>
            <FaCamera className={styles.cameraIcon} />
            사진 첨부하기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />

          {/* Display attached images (stable keys) */}
          {attachedImages.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {attachedImages.map((img) => (
                <div key={img.id} className={styles.imagePreview}>
                  <img src={img.url} alt="Preview" />
                  <button
                    className={styles.removeImageButton}
                    onClick={() => removeImage(img.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className={styles.line}></div>
        <button
          className={`${styles.submitButton} ${
            isFormValid ? styles.submitButtonActive : ''
          }`}
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          등록하기
        </button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className={styles.successMessage}>
          리뷰가 등록되어 포인트 300원이 적립되었습니다.
        </div>
      )}
    </div>
  );
}
