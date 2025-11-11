'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { FaImage } from 'react-icons/fa';
import Image from 'next/image';
import styles from './EditReview.module.css';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';
import { ReviewFileService } from '@/app/api/services/client/fileService/reviewFileService';
import { Review } from '@/app/api/types/member/review/review';
import Loading from '@/app/components/ui/Loading/Loading';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { setHasLoadedOnce } from '@/app/redux/slices/auth/ui/loadingSlice';

type NewImage = {
  id: string;
  file: File;
  url: string;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'error';
  fileId?: string;
};

export default function EditReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reviewId = searchParams.get('reviewId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get hasLoadedOnce state from Redux
  const hasLoadedOnce = useAppSelector(
    (state) => state.loading.hasLoadedOnce[`edit-review-${reviewId}`] || false
  );
  const [loading, setLoading] = useState<boolean>(!hasLoadedOnce);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form state
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [attachedImages, setAttachedImages] = useState<NewImage[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  // Fetch review data
  useEffect(() => {
    let isMounted = true;

    // Only show loading if not loaded before
    if (!hasLoadedOnce) {
      setLoading(true);
    }
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
          // Mark as loaded once
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

  const handleStarClick = (starIndex: number) => setRating(starIndex);
  const handleStarHover = (starIndex: number) => setHoveredStar(starIndex);
  const handleStarLeave = () => setHoveredStar(0);

  const handlePhotoUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || !reviewId) return;

    // Clear existing images when new ones are selected
    if (existingImages.length > 0) {
      // Delete existing images from server
      for (const imageUrl of existingImages) {
        const urlParts = imageUrl.split('/');
        const encryptedId = urlParts[urlParts.length - 1];

        if (encryptedId) {
          try {
            await ReviewFileService.deleteFile(encryptedId);
            console.log('Existing image deleted from server:', encryptedId);
          } catch (err) {
            console.error('Error deleting existing image:', err);
          }
        }
      }

      // Clear existing images from state
      setExistingImages([]);
    }

    const additions: NewImage[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
      uploadStatus: 'uploading' as const, // Set to uploading immediately
    }));
    setAttachedImages((prev) => [...prev, ...additions]);

    // Upload files immediately
    setUploading(true);

    try {
      const filesArray = Array.from(files);
      const uploadResponse = await ReviewFileService.uploadMultipleFiles(
        filesArray,
        {
          entityType: 'review',
          entityId: reviewId,
        }
      );

      if (uploadResponse.error) {
        console.error('Failed to upload images:', uploadResponse.error);
        setError('이미지 업로드에 실패했습니다.');

        // Mark images as error
        setAttachedImages((prev) =>
          prev.map((img) => {
            if (additions.some((add) => add.id === img.id)) {
              return { ...img, uploadStatus: 'error' as const };
            }
            return img;
          })
        );

        // Remove error images after a delay
        setTimeout(() => {
          setAttachedImages((prev) =>
            prev.filter((img) => !additions.some((add) => add.id === img.id))
          );
        }, 3000);
      } else if (uploadResponse.data) {
        const newEncryptedIds = uploadResponse.data.data.map(
          (file) => file.encryptedId
        );
        setUploadedFileIds((prev) => [...prev, ...newEncryptedIds]);

        // Mark images as uploaded and store encrypted IDs
        setAttachedImages((prev) =>
          prev.map((img) => {
            const additionIndex = additions.findIndex(
              (add) => add.id === img.id
            );
            if (additionIndex !== -1) {
              return {
                ...img,
                uploadStatus: 'uploaded' as const,
                fileId: newEncryptedIds[additionIndex],
              };
            }
            return img;
          })
        );

        console.log('Files uploaded successfully:', newEncryptedIds);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('이미지 업로드 중 오류가 발생했습니다.');

      // Mark images as error
      setAttachedImages((prev) =>
        prev.map((img) => {
          if (additions.some((add) => add.id === img.id)) {
            return { ...img, uploadStatus: 'error' as const };
          }
          return img;
        })
      );

      // Remove error images after a delay
      setTimeout(() => {
        setAttachedImages((prev) =>
          prev.filter((img) => !additions.some((add) => add.id === img.id))
        );
      }, 3000);
    } finally {
      setUploading(false);
    }
  };

  const removeNewImage = async (id: string) => {
    const img = attachedImages.find((x) => x.id === id);
    if (!img) return;

    // If the image was uploaded and has an encryptedId, delete it from server
    if (img.uploadStatus === 'uploaded' && img.fileId) {
      try {
        const deleteResponse = await ReviewFileService.deleteFile(img.fileId);
        if (deleteResponse.error) {
          console.warn(
            'Failed to delete file from server:',
            deleteResponse.error
          );
        } else {
          console.log('File deleted from server successfully');
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Remove from local state
    setAttachedImages((prev) => {
      const img = prev.find((x) => x.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((x) => x.id !== id);
    });

    // Remove from uploadedFileIds if it was uploaded
    if (img.uploadStatus === 'uploaded' && img.fileId) {
      setUploadedFileIds((prev) =>
        prev.filter((fileId) => fileId !== img.fileId)
      );
    }
  };

  const removeExistingImage = async (imageUrl: string) => {
    // Extract encryptedId from the URL
    // URL format: /api/pet-save/files/{encryptedId}
    const urlParts = imageUrl.split('/');
    const encryptedId = urlParts[urlParts.length - 1];

    console.log('Attempting to delete existing image:', {
      imageUrl,
      extractedEncryptedId: encryptedId,
      urlParts,
    });

    if (encryptedId) {
      try {
        const deleteResponse = await ReviewFileService.deleteFile(encryptedId);
        console.log('Delete response:', deleteResponse);

        if (deleteResponse.error) {
          console.warn(
            'Failed to delete existing file from server:',
            deleteResponse.error
          );
          console.warn('Full delete response:', deleteResponse);
        } else {
          console.log('Existing file deleted from server successfully');
        }
      } catch (err) {
        console.error('Error deleting existing file:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
        });
      }
    } else {
      console.warn('Could not extract encryptedId from URL:', imageUrl);
    }

    // Remove from local state regardless of server deletion result
    setExistingImages((prev) => prev.filter((x) => x !== imageUrl));
  };

  // revoke URLs on unmount
  useEffect(() => {
    return () => {
      attachedImages.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, [attachedImages]);

  const handleSubmit = async () => {
    if (rating <= 0 || !reviewText.trim() || !reviewId) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare review data
      if (!review) {
        setError('리뷰 정보를 찾을 수 없습니다.');
        setSubmitting(false);
        return;
      }

      const reviewData: {
        rating: number;
        content: string;
        imageFileIds: string[];
      } = {
        rating: rating,
        content: reviewText.trim(),
        imageFileIds: uploadedFileIds, // Always include, even if empty array
      };

      console.log('Sending review update data:', reviewData);
      console.log('Review ID:', reviewId);
      console.log('Uploaded file IDs:', uploadedFileIds);

      // Update the review
      const updateResponse = await ReviewService.updateReview(
        reviewId,
        reviewData
      );

      if (updateResponse.error) {
        console.error('Review update error:', updateResponse.error);
        setError(`리뷰 수정에 실패했습니다: ${updateResponse.error}`);
        setSubmitting(false);
        return;
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        router.push(`/client/pages/my-page/reviews/view?reviewId=${reviewId}`);
      }, 2000);
    } catch (err) {
      console.error('Failed to update review:', err);
      setError('리뷰 수정 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  // Check if all images are uploaded (no uploading or error status)
  const allImagesUploaded = attachedImages.every(
    (img) => img.uploadStatus === 'uploaded'
  );
  const hasUploadingImages = attachedImages.some(
    (img) => img.uploadStatus === 'uploading'
  );
  const isFormValid =
    rating > 0 &&
    reviewText.trim().length > 0 &&
    allImagesUploaded &&
    !hasUploadingImages;

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

  // At this point, review is guaranteed to be non-null due to the check above
  const reviewData = review!;

  return (
    <div className={styles.container}>
      <ProductHeader />

      <div className={styles.content}>
        {/* Product Info */}
        <div className={styles.productSection}>
          <div className={styles.productImage}>
            <img
              src={reviewData.product.productThumbnail}
              alt={reviewData.product.productName}
            />
          </div>
          <div className={styles.productInfo}>
            <div className={styles.productName}>
              {reviewData.product.productName}
            </div>
            <div className={styles.productStore}>
              {reviewData.product.productNumber}
            </div>
            <div className={styles.purchaseDate}>
              {new Date(reviewData.createdAt)
                .toLocaleDateString('ko-KR', {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit',
                })
                .replace(/\./g, '.')
                .replace(/\s/g, '')}{' '}
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
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const isFilled = starIndex <= (hoveredStar || rating);
              return (
                <button
                  key={starIndex}
                  className={styles.starButton}
                  onClick={() => handleStarClick(starIndex)}
                  onMouseEnter={() => handleStarHover(starIndex)}
                  onMouseLeave={handleStarLeave}
                >
                  <Image
                    src={
                      isFilled
                        ? '/images/icons/filledStar.svg'
                        : '/images/icons/blankStar.svg'
                    }
                    alt={isFilled ? 'Filled star' : 'Blank star'}
                    width={43}
                    height={43}
                    className={styles.star}
                  />
                </button>
              );
            })}
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
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className={styles.existingImagesContainer}>
              <div className={styles.imageGrid}>
                {existingImages.map((image) => (
                  <div key={image} className={styles.imagePreview}>
                    <img src={image} alt="Existing" />
                    <button
                      className={styles.removeImageButton}
                      onClick={() => removeExistingImage(image)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {attachedImages.length > 0 && (
            <div className={styles.newImagesContainer}>
              <div className={styles.imageGrid}>
                {attachedImages.map((img) => (
                  <div key={img.id} className={styles.imagePreview}>
                    <img src={img.url} alt="New Preview" />
                    {img.uploadStatus === 'uploading' && (
                      <div className={styles.uploadOverlay}>
                        <div className={styles.uploadSpinner}></div>
                        <span>업로드 중...</span>
                      </div>
                    )}
                    {img.uploadStatus === 'error' && (
                      <div className={styles.errorOverlay}>
                        <span>업로드 실패</span>
                      </div>
                    )}
                    {img.uploadStatus === 'uploaded' && (
                      <div className={styles.successOverlay}>
                        <span>✓</span>
                      </div>
                    )}
                    <button
                      className={styles.removeImageButton}
                      onClick={() => removeNewImage(img.id)}
                      disabled={img.uploadStatus === 'uploading'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className={styles.photoButton}
            onClick={handlePhotoUpload}
            disabled={uploading}
          >
            <div className={styles.photoButtonContent}>
              <FaImage className={styles.imageIcon} />
              <span className={styles.photoButtonText}>
                {uploading ? '업로드 중...' : '사진 첨부하기'}
              </span>
            </div>
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
            isFormValid && !submitting ? styles.submitButtonActive : ''
          }`}
          onClick={handleSubmit}
          disabled={!isFormValid || submitting}
        >
          {submitting ? '수정 중...' : '수정하기'}
        </button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className={styles.successMessage}>리뷰가 수정되었습니다.</div>
      )}
    </div>
  );
}
