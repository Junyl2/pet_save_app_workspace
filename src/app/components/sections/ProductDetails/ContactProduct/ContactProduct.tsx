'use client';
import { productContactService } from '@/app/api/services/contact-product/productContactService';
import { ProductSummary } from '@/app/api/types/products/productSummary';
import styles from './ContactProduct.module.css';
import { useState, useEffect } from 'react';
import { IoCallOutline } from 'react-icons/io5';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { CiImageOn } from 'react-icons/ci';
import { useRouter } from 'next/navigation';
import { ContactDrawer } from '@/app/components/ui/drawer/ContactDrawer/ContactDrawer';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import Loading from '../../../ui/Loading/Loading';

interface ContactProductProps {
  productId: string;
}

export const ContactProduct = ({ productId }: ContactProductProps) => {
  const router = useRouter();
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);

  const [inquiryType, setInquiryType] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await productContactService.getProductById(
          productId
        );
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('상품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  if (loading) return <Loading />;

  if (!product) return <p>상품을 찾을 수 없습니다.</p>;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!product.productId) {
        toast.error('상품 정보를 찾을 수 없습니다.');
        return;
      }

      const response = await productContactService.submitInquiry({
        productId: product.productId,
        inquiryType,
        content,
        file: file,
      });

      if (response.error) {
        toast.error('문의 접수 중 오류가 발생했습니다.');
        return;
      }

      // Show toast
      toast.success('문의가 정상적으로 접수되었습니다.');

      // Redirect back after a short delay (e.g., 1.5s)
      setTimeout(() => {
        router.back();
      }, 1600);
    } catch (err) {
      console.error(err);
      toast.error('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
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
      {/* React Hot Toast */}
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
            style: {
              background: '#2F6F5E',
              color: '#fff',
            },
            iconTheme: {
              primary: '#2F6F5E',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Seller Profile */}
      <div className={styles.sellerProfile}>
        <Image
          src={product.store.profileUrl || '/fallback-shop.png'}
          alt={product.store.name || '판매자'}
          className={styles.shopImage}
          width={50}
          height={50}
        />
        <div className={styles.shopInfo}>
          <h3>{product.store.name}</h3>
          <p className={styles.details}>{product.store.address}</p>
        </div>
        <div className={styles.contactWrapper}>
          <button
            className={styles.contactButton}
            onClick={() => setShowDrawer(true)}
          >
            <IoCallOutline size={16} className={styles.call} />
            전화 문의
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className={styles.productInfoRow}>
        <Image
          src={product.thumbnail || '/images/products/noresult.png'}
          alt={product.productName || '상품 이미지'}
          className={styles.productThumbnail}
          width={80}
          height={80}
        />
        <div className={styles.productDetailsColumn}>
          <p className={styles.productName}>{product.productName}</p>
          <p className={styles.productPrice}>
            {product.discountedPrice
              ? `${product.discountedPrice.toLocaleString()}원`
              : `${product.salePrice.toLocaleString()}원`}
          </p>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className={styles.form}>
        {/* Custom Dropdown */}
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
              {options.map((opt, i) => (
                <div
                  key={i}
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

        <div className={styles.fileUploadWrapper}>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.hiddenFileInput}
          />
          <div className={styles.labelWrapper}>
            <CiImageOn size={16} color="rgba(0,0,0,0.4)" />
            <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
              사진 첨부하기
            </label>
          </div>

          {/* File Preview */}
          {filePreview && (
            <div className={styles.filePreview}>
              <Image
                src={filePreview}
                alt="Preview"
                width={100}
                height={100}
                className={styles.previewImage}
              />
              <div className={styles.fileInfo}>
                <p className={styles.fileName}>{file?.name}</p>
                <button
                  type="button"
                  onClick={removeFile}
                  className={styles.removeFileButton}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        <p className={styles.note}>
          문의하신 내용에 대한 답변은 앱의 마이페이지 1:1 문의에서 확인할 수
          있습니다
        </p>
        <button
          onClick={handleSubmit}
          disabled={!inquiryType || !content || submitting}
          className={
            !inquiryType || !content || submitting ? styles.disabledButton : ''
          }
        >
          {submitting ? '문의 중...' : '문의하기'}
        </button>
      </div>

      {showDrawer && <ContactDrawer onClose={() => setShowDrawer(false)} />}
    </div>
  );
};
