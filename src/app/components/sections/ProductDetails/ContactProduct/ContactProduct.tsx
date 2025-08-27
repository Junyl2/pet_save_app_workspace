'use client';
import { productContactService } from '@/app/api/services/contact-product/productContactService';
import styles from './ContactProduct.module.css';
import { useState } from 'react';
import { IoCallOutline } from 'react-icons/io5';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { CiImageOn } from 'react-icons/ci';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface ContactProductProps {
  productId: number;
}

export const ContactProduct = ({ productId }: ContactProductProps) => {
  const router = useRouter();
  const product = productContactService.getProductById(productId);

  const [inquiryType, setInquiryType] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!product) return <p>상품을 찾을 수 없습니다.</p>;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await productContactService.submitInquiry({
        productId: product.id,
        inquiryType,
        content,
        fileName: file?.name || null,
      });

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
        <img
          src={product.shopImage}
          alt={product.shopName}
          className={styles.shopImage}
        />
        <div className={styles.shopInfo}>
          <h3>{product.shopName}</h3>
          <p className={styles.details}>
            {product.shopLocation} · {product.shopDistance}
          </p>
        </div>
        <div className={styles.contactWrapper}>
          <button className={styles.contactButton}>
            <IoCallOutline size={16} className={styles.call} />
            전화 문의
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className={styles.productInfoRow}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.productThumbnail}
        />
        <div className={styles.productDetailsColumn}>
          <p className={styles.productName}>{product.name}</p>
          <p className={styles.productPrice}>{product.price}</p>
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
          placeholder="문의 내용을 입력해주세요 (500자 이내)"
          maxLength={500}
        />

        <div className={styles.fileUploadWrapper}>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className={styles.hiddenFileInput}
          />
          <div className={styles.labelWrapper}>
            <CiImageOn size={16} color="rgba(0,0,0,0.4)" />
            <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
              사진 첨부하기
            </label>
          </div>
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
    </div>
  );
};
