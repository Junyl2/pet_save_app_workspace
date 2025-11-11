'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaCamera } from 'react-icons/fa';
import Image from 'next/image';
import styles from '../write/WriteReview.module.css';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';
import { ReviewFileService } from '@/app/api/services/client/fileService/reviewFileService';
import { Review } from '@/app/api/types/member/review/review';
import Loading from '@/app/components/ui/Loading/Loading';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { setHasLoadedOnce } from '@/app/redux/slices/auth/ui/loadingSlice';

type NewImage = { id: string; file: File; url: string };

export default function EditReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reviewId = searchParams.get('reviewId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedOnce = useAppSelector(
    (state) => state.loading.hasLoadedOnce[`edit-review-${reviewId}`] || false
  );
  const [loading, setLoading] = useState<boolean>(!hasLoadedOnce);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [attachedImages, setAttachedImages] = useState<NewImage[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    if (!hasLoadedOnce) setLoading(true);
    setError(null);

    const fetchReview = async () => {
      if (!reviewId) {
        setError('리뷰 ID가 필요합니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await ReviewService.getReviewById(reviewId);

        if (!isMounted) return;

        if (response.error) {
          setError('리뷰를 불러올 수 없습니다.');
        } else if (response.data) {
          const reviewData = response.data;
          setReview(reviewData);
          setRating(reviewData.rating);
          setReviewText(reviewData.content || '');
          setExistingImages(reviewData.imageUrls || []);
          setUploadedFileIds(
            reviewData.imageUrls?.map((url) => {
              const urlParts = url.split('/');
              return urlParts[urlParts.length - 1];
            }) || []
          );
          dispatch(setHasLoadedOnce(`edit-review-${reviewId}`));
        } else {
          setError('리뷰 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to fetch review:', err);
        setError('리뷰를 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchReview();

    return () => {
      isMounted = false;
    };
  }, [reviewId, hasLoadedOnce, dispatch]);

  const handleStarClick = (i: number) => setRating(i);
  const handleStarHover = (i: number) => setHoveredStar(i);
  const handleStarLeave = () => setHoveredStar(0);

  const handlePhotoUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !reviewId) return;

    const additions = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
    }));
    setAttachedImages((prev) => [...prev, ...additions]);

    setUploadingFiles(true);
    setUploadProgress('이미지 업로드 중...');

    try {
      const filesArray = Array.from(files);
      const uploadResponse = await ReviewFileService.uploadMultipleFiles(
        filesArray,
        {
          entityType: 'review',
          entityId: reviewId,
        }
      );

      if (uploadResponse.error || !uploadResponse.data?.data) {
        throw new Error(uploadResponse.error || '파일 업로드에 실패했습니다.');
      }

      const newFileIds = uploadResponse.data.data
        .filter((f) => f.encryptedId)
        .map((f) => f.encryptedId);

      setUploadedFileIds((prev) => [...prev, ...newFileIds]);
      setUploadProgress('');
    } catch (err) {
      console.error('Upload error:', err);
      setError('이미지 업로드 중 오류가 발생했습니다.');
      setAttachedImages((prev) =>
        prev.filter((img) => !additions.some((add) => add.id === img.id))
      );
    } finally {
      setUploadingFiles(false);
      setUploadProgress('');
    }
  };

  const removeImage = (id: string) => {
    const img = attachedImages.find((x) => x.id === id);
    if (!img) return;

    setAttachedImages((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((x) => x.id !== id);
    });

    const urlParts = img.url.split('/');
    const encryptedId = urlParts[urlParts.length - 1];
    if (encryptedId && uploadedFileIds.includes(encryptedId)) {
      setUploadedFileIds((prev) =>
        prev.filter((fileId) => fileId !== encryptedId)
      );
    }
  };

  const removeExistingImage = async (imageUrl: string) => {
    const urlParts = imageUrl.split('/');
    const encryptedId = urlParts[urlParts.length - 1];

    if (encryptedId) {
      try {
        await ReviewFileService.deleteFile(encryptedId);
      } catch (err) {
        console.error('Error deleting existing file:', err);
      }
    }

    setExistingImages((prev) => prev.filter((x) => x !== imageUrl));
    setUploadedFileIds((prev) =>
      prev.filter((fileId) => fileId !== encryptedId)
    );
  };

  useEffect(() => {
    return () => {
      attachedImages.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, [attachedImages]);

  const handleSubmit = async () => {
    if (
      rating <= 0 ||
      !reviewText.trim() ||
      !reviewId ||
      submitting ||
      uploadingFiles
    )
      return;

    setSubmitting(true);

    try {
      if (!review) {
        setError('리뷰 정보를 찾을 수 없습니다.');
        setSubmitting(false);
        return;
      }

      const reviewData = {
        rating: rating,
        content: reviewText.trim(),
        imageFileIds: uploadedFileIds,
      };

      const updateResponse = await ReviewService.updateReview(
        reviewId,
        reviewData
      );

      if (updateResponse.error) {
        alert('리뷰 수정에 실패했습니다. 다시 시도해주세요.');
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          router.push(
            `/client/pages/my-page/reviews/view?reviewId=${reviewId}`
          );
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to update review:', err);
      alert('리뷰 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    rating > 0 &&
    reviewText.trim().length > 0 &&
    !submitting &&
    !uploadingFiles;

  if (loading) return <Loading />;

  if (error || !review) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.content}>
          <p className={styles.error}>
            {error || '리뷰를 불러올 수 없습니다.'}
          </p>
        </div>
      </div>
    );
  }

  const allImages = [
    ...existingImages.map((url) => ({ type: 'existing' as const, url })),
    ...attachedImages.map((img) => ({
      type: 'new' as const,
      url: img.url,
      id: img.id,
    })),
  ];

  return (
    <div className={styles.container}>
      <ProductHeader />
      <div className={styles.content}>
        {/* Product Info */}
        <div className={styles.productSection}>
          <div className={styles.productImage}>
            {review.product.productThumbnail ? (
              <Image
                src={review.product.productThumbnail}
                alt={review.product.productName}
                width={90}
                height={90}
                priority
              />
            ) : (
              <span className={styles.altText}>
                {review.product.productName}
              </span>
            )}
          </div>

          <div className={styles.productInfo}>
            <div className={styles.productName}>
              {review.product.productName}
            </div>
            <div className={styles.productStore}>
              {review.product.productNumber || '상점 정보 없음'}
            </div>
            <div className={styles.purchaseDate}>
              {review.createdAt
                ? new Date(review.createdAt)
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

          {allImages.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {allImages.map((img) => (
                <div
                  key={img.type === 'existing' ? img.url : img.id}
                  className={styles.imagePreview}
                >
                  <img src={img.url} alt="Preview" />
                  <button
                    className={styles.removeImageButton}
                    onClick={() =>
                      img.type === 'existing'
                        ? removeExistingImage(img.url)
                        : removeImage(img.id)
                    }
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
            ? '수정 중...'
            : '수정하기'}
        </button>
      </div>

      {showSuccessMessage && (
        <div className={styles.successMessage}>리뷰가 수정되었습니다.</div>
      )}
    </div>
  );
}
