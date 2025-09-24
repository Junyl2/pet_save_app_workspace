'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaStar, FaCamera } from 'react-icons/fa';
import styles from './EditReview.module.css';

// Mock review data - in real app, this would come from API
const mockReviews = [
  {
    id: 1,
    productName: '탐사 강아지 고구마말랭이 간식',
    store: '○○ 동물병원',
    purchaseDate: '25.07.30',
    image: '/images/products/dog-snack.png',
    rating: 5,
    reviewText:
      '우리 강아지가 너무 잘 먹어요! 고구마 말랭이라 건강에도 좋고, 말랑해서 먹기도 편해 보여요. 간식 줄 때마다 꼬리를 흔들며 좋아하네요. 재구매 의사 100%입니다!',
    existingImages: [
      '/images/products/dog-snack.png',
      '/images/products/dog-snack2.png',
      '/images/products/dogfood.png',
    ],
  },
];

type NewImage = { id: string; file: File; url: string };

export default function EditReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reviewId = searchParams.get('reviewId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find review by ID (default to first review if not found)
  const existingReview =
    mockReviews.find((r) => r.id.toString() === reviewId) || mockReviews[0];

  const [rating, setRating] = useState<number>(existingReview.rating);
  const [reviewText, setReviewText] = useState<string>(
    existingReview.reviewText
  );
  const [attachedImages, setAttachedImages] = useState<NewImage[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    existingReview.existingImages || []
  );
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

  const removeNewImage = (id: string) => {
    setAttachedImages((prev) => {
      const img = prev.find((x) => x.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  // revoke URLs on unmount
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
        router.push(
          `/client/pages/my-page/reviews/view?reviewId=${existingReview.id}`
        );
      }, 2000);
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
            <img src={existingReview.image} alt={existingReview.productName} />
          </div>
          <div className={styles.productInfo}>
            <div className={styles.productName}>
              {existingReview.productName}
            </div>
            <div className={styles.productStore}>{existingReview.store}</div>
            <div className={styles.purchaseDate}>
              {existingReview.purchaseDate} 주문
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
          {/* Existing Images (stable keys by URL) */}
          {existingImages.length > 0 && (
            <div className={styles.existingImagesContainer}>
              <div className={styles.imageGrid}>
                {existingImages.map((image) => (
                  <div key={image} className={styles.imagePreview}>
                    <img src={image} alt="Existing" />
                    <button
                      className={styles.removeImageButton}
                      onClick={() =>
                        setExistingImages((prev) =>
                          prev.filter((x) => x !== image)
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images (stable keys by id) */}
          {attachedImages.length > 0 && (
            <div className={styles.newImagesContainer}>
              <div className={styles.imageGrid}>
                {attachedImages.map((img) => (
                  <div key={img.id} className={styles.imagePreview}>
                    <img src={img.url} alt="New Preview" />
                    <button
                      className={styles.removeImageButton}
                      onClick={() => removeNewImage(img.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          수정하기
        </button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className={styles.successMessage}>리뷰가 수정되었습니다.</div>
      )}
    </div>
  );
}
