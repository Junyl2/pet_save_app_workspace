'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IoCallOutline } from 'react-icons/io5';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { CiImageOn } from 'react-icons/ci';
import toast, { Toaster } from 'react-hot-toast';
import styles from './ContactProduct.module.css';

import { productContactService } from '@/app/api/services/contact-product/productContactService';
import { MemberInquiryService } from '@/app/api/services/client/memberService/inquiry-details/memberInquiryService';
import { ProductSummary } from '@/app/api/types/products/productSummary';
import { ContactDrawer } from '@/app/components/ui/drawer/ContactDrawer/ContactDrawer';
import { StoreService } from '@/app/api/services/client/storeService/storeService';
import { StoreInfo } from '@/app/api/types/member/store/store';
import { SellerProductListService } from '@/app/api/services/client/productService/sellerProductListService';
import Loading from '../../../ui/Loading/Loading';

interface ContactProductProps {
  productId?: string;
  storeId?: string;
}

type AttachedImage = { id: string; file: File; url: string };

export const ContactProduct = ({ productId, storeId }: ContactProductProps) => {
  const router = useRouter();
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >(productId);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);

  const [inquiryType, setInquiryType] = useState('');
  const [content, setContent] = useState('');
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  console.log('ContactProduct props:', { productId, storeId });

  /** Fetch product or store info */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (productId) {
          // Fetch product info
          const productData = await productContactService.getProductById(
            productId
          );
          if (!productData) {
            toast.error('상품 정보를 불러오는데 실패했습니다.');
            return;
          }
          setProduct(productData);
          setSelectedProductId(productId);
        } else if (storeId) {
          // Fetch store info and get first product
          const storeResponse = await StoreService.getStoreDetails(storeId);
          console.log('storeResponse:', storeResponse);

          if (storeResponse.error || !storeResponse.data?.data) {
            toast.error('매장 정보를 불러오는데 실패했습니다.');
            return;
          }

          setStore(storeResponse.data.data);
          console.log('Store raw data:', storeResponse.data.data);

          // Get first product from store to use for inquiry
          const productsResponse =
            await SellerProductListService.getProductsByStoreId({
              storeId,
              registrationStatus: 'ONSALE',
              page: 0,
              size: 1,
              sortBy: 'createdAt',
              direction: 'desc',
            });

          if (
            !productsResponse.error &&
            productsResponse.data?.data?.content &&
            productsResponse.data.data.content.length > 0
          ) {
            const firstProduct = productsResponse.data.data.content[0];
            // Fetch full product details
            const productData = await productContactService.getProductById(
              firstProduct.productId
            );
            if (productData) {
              setProduct(productData);
              setSelectedProductId(firstProduct.productId);
            }
          }
        }
      } catch (error) {
        console.error('[ContactProduct] Fetch error:', error);
        toast.error('정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (productId || storeId) fetchData();
  }, [productId, storeId]);

  /** Cleanup preview URLs on unmount */
  useEffect(() => {
    return () => {
      attachedImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [attachedImages]);

  if (loading) return <Loading />;
  if (!product && !store) return <p>정보를 찾을 수 없습니다.</p>;

  // Use store info if product is not available
  const displayStore = (() => {
    const p = product?.store;
    const s = store;

    if (!p && !s) return null;

    return {
      storeId: s?.storeId ?? p?.storeId ?? '',
      name: p?.name ?? s?.businessName ?? '',
      address: p?.address ?? s?.roadAddress ?? '',
      profileUrl: p?.profileUrl ?? s?.businessProfileImage ?? null,
      phoneInquiryAllowed: p?.phoneInquiryAllowed ?? false,
    };
  })();
  console.log('displayStore:', displayStore);

  /** File handling */
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

  /** Submit inquiry */
  const handleSubmit = async () => {
    if (submitting || uploadingFiles) return;

    setSubmitting(true);
    let uploadedEncryptedIds: string[] = [];
    let uploadedFileIds: string[] = [];

    try {
      if (!selectedProductId) {
        toast.error('상품 정보를 찾을 수 없습니다.');
        return;
      }

      // Step 1: Upload files first and get encryptedId
      if (attachedImages.length > 0) {
        setUploadingFiles(true);
        const files = attachedImages.map((img) => img.file);

        const uploadResponse = await MemberInquiryService.uploadInquiryFiles(
          files,
          {
            entityType: 'INQUIRY',
            documentType: 'INQUIRY_ATTACHMENT',
            description: `Attachment for inquiry about product ${selectedProductId}`,
          }
        );

        if (uploadResponse.error || !uploadResponse.data?.data) {
          throw new Error(
            uploadResponse.error || '파일 업로드에 실패했습니다.'
          );
        }

        uploadedEncryptedIds = uploadResponse.data.data
          .filter((f) => f.encryptedId)
          .map((f) => f.encryptedId);

        uploadedFileIds = uploadResponse.data.data
          .filter((f) => f.fileId)
          .map((f) => f.fileId);

        if (attachedImages.length > 0 && uploadedEncryptedIds.length === 0) {
          throw new Error('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        }
      }

      // Step 2: Create inquiry with encryptedIds
      const response = await productContactService.submitInquiry({
        productId: selectedProductId,
        inquiryType,
        content,
        encryptedIds: uploadedEncryptedIds,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      // Step 3: Attach files to the inquiry entity
      // For inquiry files, attach each file individually using fileId as entityId
      if (uploadedFileIds.length > 0) {
        for (const fileId of uploadedFileIds) {
          await MemberInquiryService.attachFilesToInquiry(fileId, [fileId]);
        }
      }

      toast.success('문의가 정상적으로 접수되었습니다.');
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : '문의 접수 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
    }
  };

  const options = [
    '상품 문의',
    '배송/픽업 문의',
    '교환/환불/교환 문의',
    '결제 문의',
    '기타 문의',
  ];

  return (
    <div className={styles.container}>
      {/* Toast */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
            width: '100%',
            textAlign: 'center',
            marginBottom: '50vh',
          },
          success: {
            style: { background: '#2F6F5E', color: '#fff' },
            iconTheme: { primary: '#2F6F5E', secondary: '#fff' },
          },
        }}
      />

      {/* Seller Profile */}
      {displayStore && (
        <div className={styles.sellerProfile}>
          <div className={styles.profileWrapper}>
            <img
              src={displayStore.profileUrl || '/fallback-shop.png'}
              alt={displayStore.name || '판매자'}
              className={styles.shopImage}
              width={50}
              height={50}
            />
          </div>

          <div className={styles.shopInfo}>
            <h3>{displayStore.name}</h3>
            <p className={styles.details}>{displayStore.address}</p>
          </div>

          <div className={styles.contactWrapper}>
            {displayStore.phoneInquiryAllowed && (
              <button
                className={styles.contactButton}
                onClick={() => {
                  if (!displayStore.storeId) {
                    toast.error('판매자 정보를 찾을 수 없습니다.');
                    return;
                  }
                  setShowDrawer(true);
                }}
              >
                <IoCallOutline size={16} className={styles.call} />
                전화 문의
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Info - Only show if product is available */}
      {product && (
        <div className={styles.productInfoRow}>
          <div className={styles.imageWrapper}>
            <Image
              src={product.thumbnail || '/images/products/noresut.png'}
              alt={product.productName}
              className={styles.productThumbnail}
              fill
            />
          </div>

          <div className={styles.productDetailsColumn}>
            <p className={styles.productName}>{product.productName}</p>
            <p className={styles.productPrice}>
              {(product.discountedPrice ?? product.salePrice).toLocaleString()}
              원
            </p>
          </div>
        </div>
      )}

      {/* Inquiry Form */}
      <div className={styles.form}>
        {/* Dropdown */}
        <div className={styles.customDropdown}>
          <div
            className={styles.dropdownHeader}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span
              className={
                inquiryType ? styles.selectedOption : styles.placeholder
              }
            >
              {inquiryType || '문의 유형을 선택해주세요'}
            </span>
            <span className={styles.chevron}>
              {dropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>

          {dropdownOpen && (
            <div className={styles.dropdownList}>
              {options.map((opt) => (
                <div
                  key={opt}
                  className={styles.dropdownItem}
                  onClick={() => {
                    setInquiryType(opt);
                    setDropdownOpen(false);
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="문의 내용을 입력해주세요 (1000자 이내)"
          maxLength={1000}
        />

        {/* File Upload */}
        <div className={styles.fileUploadSection}>
          <div className={styles.fileUploadWrapper}>
            <input
              type="file"
              id="fileUpload"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
            />
            <div className={styles.labelWrapper}>
              <CiImageOn size={16} color="rgba(0,0,0,0.4)" />
              <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                사진 첨부하기
              </label>
            </div>
          </div>

          {/* Image Previews - displayed below the upload button */}
          {attachedImages.length > 0 && (
            <div className={styles.filePreviewsContainer}>
              {attachedImages.map((img) => (
                <div key={img.id} className={styles.filePreview}>
                  <div className={styles.imageContainer}>
                    <Image
                      src={img.url}
                      alt="Preview"
                      width={100}
                      height={100}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className={styles.removeFileButton}
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles.fileInfo}>
                    <p className={styles.fileName}>{img.file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className={styles.note}>
          문의하신 내용에 대한 답변은 마이페이지 1:1 문의에서 확인하실 수
          있습니다.
        </p>

        <button
          onClick={handleSubmit}
          disabled={!inquiryType || !content || submitting || uploadingFiles}
          className={
            !inquiryType || !content || submitting || uploadingFiles
              ? styles.disabledButton
              : ''
          }
        >
          {uploadingFiles
            ? '파일 업로드 중...'
            : submitting
            ? '문의 중...'
            : '문의하기'}
        </button>
      </div>

      {/* Drawer */}
      {showDrawer && displayStore?.storeId && (
        <ContactDrawer
          storeId={displayStore.storeId}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </div>
  );
};
