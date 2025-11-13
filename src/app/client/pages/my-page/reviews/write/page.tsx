'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaCamera } from 'react-icons/fa';
import styles from './WriteReview.module.css';
import { ProductService } from '@/app/api/services/client/productService/productService';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';
import { ReviewFileService } from '@/app/api/services/client/fileService/reviewFileService';
import { ProductSummary } from '@/app/api/types/products/productSummary';
import { ReviewCreateDto } from '@/app/api/types/member/review/review';
import Loading from '@/app/components/ui/Loading/Loading';
import Image from 'next/image';

type NewImage = { id: string; file: File; url: string };

export default function WriteReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [attachedImages, setAttachedImages] = useState<NewImage[]>([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Fetch product
  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      if (!productId) {
        setError('상품 ID가 필요합니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await ProductService.getProductSummary(productId);
        if (!active) return;

        if (response.error) {
          setError('상품을 불러올 수 없습니다.');
        } else if (response.data?.data) {
          setProduct(response.data.data);
        } else {
          setError('상품 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError('상품을 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  // Rating
  const handleStarClick = (i: number) => setRating(i);
  const handleStarHover = (i: number) => setHoveredStar(i);
  const handleStarLeave = () => setHoveredStar(0);

  // Photo upload
  const handlePhotoUpload = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const additions = Array.from(files).map((f) => ({
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

  useEffect(() => {
    return () => {
      attachedImages.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, [attachedImages]);

  // Submit
  const handleSubmit = async () => {
    if (
      !productId ||
      rating <= 0 ||
      !reviewText.trim() ||
      submitting ||
      uploadingFiles
    )
      return;

    setSubmitting(true);
    let uploadedFileIds: string[] = [];

    try {
      if (attachedImages.length > 0) {
        setUploadingFiles(true);
        setUploadProgress('이미지 업로드 중...');

        const files = attachedImages.map((img) => img.file);
        const uploadResponse = await ReviewFileService.uploadMultipleFiles(
          files,
          {
            entityType: 'review',
            entityId: productId,
          }
        );

        if (uploadResponse.error || !uploadResponse.data?.data) {
          throw new Error(
            uploadResponse.error || '파일 업로드에 실패했습니다.'
          );
        }

        uploadedFileIds = uploadResponse.data.data
          .filter((f) => f.encryptedId)
          .map((f) => f.encryptedId);

        if (attachedImages.length > 0 && uploadedFileIds.length === 0) {
          throw new Error('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        }

        setUploadProgress('리뷰 등록 중...');
      }

      const reviewData: ReviewCreateDto = {
        productId,
        rating,
        content: reviewText.trim(),
        imageFileIds: uploadedFileIds,
      };

      const response = await ReviewService.createReview(reviewData);

      if (response.error) {
        alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          router.push('/client/pages/my-page/reviews');
        }, 3000);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : '리뷰 등록 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
      setUploadProgress('');
    }
  };

  const isFormValid =
    rating > 0 &&
    reviewText.trim().length > 0 &&
    !submitting &&
    !uploadingFiles;

  if (loading) return <Loading />;

  if (error || !product) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.content}>
          <p className={styles.error}>
            {error || '상품을 불러올 수 없습니다.'}
          </p>
        </div>
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className={styles.container}>
      <ProductHeader />
      <div className={styles.content}>
        {/* Product Info */}
        <div className={styles.productSection}>
          <div className={styles.productImage}>
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.productName}
                width={90}
                height={90}
                priority
              />
            ) : (
              <span className={styles.altText}>{product.productName}</span>
            )}
          </div>

          <div className={styles.productInfo}>
            <div className={styles.productName}>{product.productName}</div>
            <div className={styles.productStore}>
              {product.store?.name || '상점 정보 없음'}
            </div>
            <div className={styles.purchaseDate}>
              {product.createdAt
                ? new Date(product.createdAt)
                    .toLocaleDateString('ko-KR', {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                    })
                    .replace(/\./g, '.')
                    .replace(/\s/g, '')
                : '날짜 정보 없음'}{' '}
              주문
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
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                className={styles.starButton}
                onClick={() => handleStarClick(i)}
                onMouseEnter={() => handleStarHover(i)}
                onMouseLeave={handleStarLeave}
              >
                <Image
                  src={
                    i <= (hoveredStar || rating)
                      ? '/images/icons/filledStar.svg'
                      : '/images/icons/blankStar.svg'
                  }
                  alt={
                    i <= (hoveredStar || rating) ? 'Filled star' : 'Blank star'
                  }
                  width={43}
                  height={43}
                  className={styles.star}
                />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Review Text */}
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

        {/* Photo Upload */}
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
      </div>

      {/* Submit Button - Fixed at Bottom */}
      <div className={styles.submitButtonContainer}>
        <button
          className={`${styles.submitButton} ${
            isFormValid ? styles.submitButtonActive : ''
          }`}
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          {uploadingFiles
            ? uploadProgress
            : submitting
            ? '등록 중...'
            : '등록하기'}
        </button>
      </div>

      {showSuccessMessage && (
        <div className={styles.successMessage}>
          리뷰가 등록되어 포인트 50원이 적립되었습니다.
        </div>
      )}
    </div>
  );
}
