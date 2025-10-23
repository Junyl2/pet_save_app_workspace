'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SellerInquiryDetails.module.css';
import { FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import BottomBar from '../../sections/BottomBar/BottomBar';
import { useUser } from '@/app/context/userContext';
import { MemberStoreService } from '@/app/api/services/client/memberService/memberStore/memberStoreService';
import { StoreInquiry } from '@/app/api/types/member/store/storeInquiry';
import { baseURL } from '@/app/api/config';

type InquiryType =
  | '전체'
  | '상품 문의'
  | '배송 문의'
  | '교환/ 환불 문의'
  | '기타 문의';

type InquiryStatus = '답변 대기 중' | '답변 완료';

const TYPE_OPTIONS: Exclude<InquiryType, '전체'>[] = [
  '상품 문의',
  '배송 문의',
  '교환/ 환불 문의',
  '기타 문의',
];

// Helper function to format date from YYYY-MM-DD to YY.MM.DD
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// Helper function to construct proper file URL from file ID
const constructFileUrl = (fileId: string | null | undefined): string => {
  if (!fileId) return '/images/products/dogfood.png';

  // If it's already a full URL, return as is
  if (fileId.startsWith('http')) return fileId;

  // If it's a relative path starting with /, return as is
  if (fileId.startsWith('/')) return fileId;

  // Otherwise, construct the full URL using the base URL
  return `${baseURL}/files/${fileId}`;
};

// Interface for the transformed inquiry data used in UI
interface TransformedInquiry {
  id: number;
  inquiryId: string;
  date: string;
  productName: string;
  productPrice: number;
  productImage: string;
  category: string;
  message: string;
  responseMessage: string;
  status: InquiryStatus;
  answering: boolean;
}

// Helper function to transform API response to UI format
const transformStoreInquiryToUI = (
  storeInquiry: StoreInquiry
): TransformedInquiry => {
  console.log('🔍 Transforming inquiry:', storeInquiry);
  console.log('🔍 Product data:', storeInquiry.product);
  console.log('🔍 Direct productName:', storeInquiry.productName);

  try {
    // Try both ways to get product name (nested and direct)
    const productName =
      storeInquiry.product?.productName ||
      storeInquiry.productName ||
      'Unknown Product';
    const productPrice =
      storeInquiry.product?.discountedPrice ||
      storeInquiry.product?.salePrice ||
      0;
    const productImage = constructFileUrl(
      storeInquiry.product?.productThumbnail
    );

    console.log('🔍 Extracted data:', {
      productName,
      productPrice,
      productImage,
    });

    return {
      id: parseInt(storeInquiry.inquiryId?.split('-')[0], 16) || 0, // Convert UUID to number for compatibility
      inquiryId: storeInquiry.inquiryId, // Keep original inquiryId for routing
      date: storeInquiry.createdAt,
      productName,
      productPrice,
      productImage,
      category: storeInquiry.category,
      message: storeInquiry.content,
      responseMessage: storeInquiry.answer || '',
      status: storeInquiry.status === 'ANSWERED' ? '답변 완료' : '답변 대기 중',
      answering: false, // Default value since API doesn't provide this
    };
  } catch (error) {
    console.error('Error transforming inquiry:', error, storeInquiry);
    // Return a fallback object
    return {
      id: 0,
      inquiryId: storeInquiry.inquiryId || 'unknown',
      date: storeInquiry.createdAt || new Date().toISOString(),
      productName: 'Unknown Product',
      productPrice: 0,
      productImage: '/images/products/dogfood.png',
      category: storeInquiry.category || 'OTHER',
      message: storeInquiry.content || 'No content',
      responseMessage: '',
      status: '답변 대기 중',
      answering: false,
    };
  }
};

// Map API categories to UI categories
const mapApiCategoryToUI = (apiCategory: string): InquiryType => {
  switch (apiCategory) {
    case 'PRODUCT':
      return '상품 문의';
    case 'DELIVERY':
      return '배송 문의';
    case 'EXCHANGE_RETURN':
      return '교환/ 환불 문의';
    case 'PAYMENT':
    case 'OTHER':
    default:
      return '기타 문의';
  }
};

export default function SellerInquiryDetails() {
  const router = useRouter();
  const { user } = useUser();

  // tabs
  const [tab, setTab] = useState<InquiryStatus>('답변 대기 중');

  // dropdown
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<InquiryType>('전체');
  const ddRef = useRef<HTMLDivElement | null>(null);

  // API data state
  const [inquiries, setInquiries] = useState<TransformedInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is approved seller
  useEffect(() => {
    if (user?.role !== 'seller' || !user?.storeId) {
      router.push('/client/pages/homepage');
      return;
    }
  }, [user, router]);

  // Fetch store inquiries from API
  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user?.role || user.role !== 'seller') return;

      setLoading(true);
      try {
        const response = await MemberStoreService.getMyStoreInquiries({
          sortBy: 'createdAt',
          direction: 'desc',
          size: 100, // Get more items to handle filtering
        });

        if (response.error || !response.data) {
          console.error('Failed to fetch store inquiries:', response.error);
          setInquiries([]);
        } else {
          // Debug: Log the actual API response structure
          console.log(
            '🔍 Raw API response structure:',
            response.data.data.content
          );
          console.log(
            '🔍 First inquiry structure:',
            response.data.data.content[0]
          );

          // Debug: Log specific product data from first inquiry
          if (response.data.data.content[0]) {
            const firstInquiry = response.data.data.content[0];
            console.log('🔍 First inquiry product:', firstInquiry.product);
            console.log(
              '🔍 First inquiry productName:',
              firstInquiry.productName
            );
            console.log('🔍 First inquiry content:', firstInquiry.content);
          }

          // Transform API response to UI format
          const transformedInquiries = response.data.data.content.map(
            transformStoreInquiryToUI
          );
          setInquiries(transformedInquiries);
        }
      } catch (error) {
        console.error('Error fetching store inquiries:', error);
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    return inquiries.filter((q) => {
      const byTab = q.status === tab;
      const byType =
        selectedType === '전체'
          ? true
          : mapApiCategoryToUI(q.category) === selectedType;
      return byTab && byType;
    });
  }, [inquiries, tab, selectedType]);

  const handlePick = (t: InquiryType) => {
    setSelectedType(t);
    setOpen(false);
  };

  const handleInquiryClick = (inquiry: TransformedInquiry) => {
    // Use the actual inquiryId from the API response
    router.push(`/client/seller/pages/reply-inquiry?id=${inquiry.inquiryId}`);
  };

  if (!user || user.role !== 'seller' || !user.storeId) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <>
        <ProductHeader />
        <div className={styles.page}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            문의 내역을 불러오는 중...
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  return (
    <>
      <ProductHeader />
      <div className={styles.page}>
        {/* Top tabs (답변대기 / 답변완료) */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${
              tab === '답변 대기 중' ? styles.active : ''
            }`}
            onClick={() => setTab('답변 대기 중')}
          >
            답변대기
          </button>
          <button
            className={`${styles.tabBtn} ${
              tab === '답변 완료' ? styles.active : ''
            }`}
            onClick={() => setTab('답변 완료')}
          >
            답변완료
          </button>
        </div>

        {/* Filter block */}
        <div className={styles.filterWrap}>
          <div className={styles.filterRow} ref={ddRef}>
            <button
              type="button"
              className={styles.filterBtn}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span
                className={
                  selectedType === '전체' ? styles.placeholder : styles.chosen
                }
              >
                {selectedType === '전체' ? '문의 유형' : selectedType}
              </span>
              <FaChevronDown
                className={`${styles.chev} ${open ? styles.rotate : ''}`}
                size={14}
                aria-hidden
              />
            </button>

            {open && (
              <div className={styles.dropdown} role="listbox" tabIndex={-1}>
                <button
                  className={styles.option}
                  role="option"
                  aria-selected={selectedType === '전체'}
                  onClick={() => handlePick('전체')}
                >
                  전체
                </button>
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={styles.option}
                    role="option"
                    aria-selected={selectedType === opt}
                    onClick={() => handlePick(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* List */}
        {/* List */}
        <div className={styles.list}>
          {filtered.map((q) => (
            <article
              key={q.id}
              className={styles.card}
              onClick={() => handleInquiryClick(q)}
              style={{ cursor: 'pointer' }}
            >
              <header className={styles.cardHead}>
                <div className={styles.headLeft}>
                  <span className={styles.headType}>
                    {mapApiCategoryToUI(q.category)}
                    <span className={styles.dot}>·</span>
                    <span className={styles.headDate}>
                      {formatDate(q.date)}
                    </span>
                  </span>
                </div>

                {/* Top right status only if tab is "답변 완료" */}
                {tab === '답변 완료' && (
                  <div
                    className={`${styles.answerStatus} ${
                      q.answering ? styles.answering : styles.answered
                    }`}
                  >
                    {q.answering ? '답변 중' : '답변 완료'}
                  </div>
                )}
              </header>

              <div className={styles.itemRow}>
                <div className={styles.thumbWrap}>
                  <Image
                    src={q.productImage || '/images/products/dogfood.png'}
                    alt=""
                    width={60}
                    height={60}
                    className={styles.thumb}
                    unoptimized
                  />
                </div>
                <div className={styles.meta}>
                  <div className={styles.title}>{q.productName}</div>
                  <div className={styles.price}>
                    {q.productPrice
                      ? `${q.productPrice.toLocaleString()}원`
                      : '가격 정보 없음'}
                  </div>
                  <div className={styles.snippet}>{q.message}</div>
                </div>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className={styles.empty}>해당 조건의 문의가 없습니다.</div>
          )}
        </div>
      </div>
      <BottomBar />
    </>
  );
}
