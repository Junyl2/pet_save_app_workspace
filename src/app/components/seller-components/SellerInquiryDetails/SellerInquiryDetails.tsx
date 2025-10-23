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
  | '교환/환불 문의'
  | '결제 문의'
  | '기타 문의';

type InquiryStatus = '답변 대기 중' | '답변 완료';

const TYPE_OPTIONS: Exclude<InquiryType, '전체'>[] = [
  '상품 문의',
  '배송 문의',
  '교환/환불 문의',
  '결제 문의',
  '기타 문의',
];

// Helper: format date from YYYY-MM-DD to YY.MM.DD
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// Helper: construct proper file URL from file ID
const constructFileUrl = (fileId: string | null | undefined): string => {
  if (!fileId) return '/images/products/dogfood.png';
  if (fileId.startsWith('http')) return fileId;
  if (fileId.startsWith('/')) return fileId;
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
  category: string; // raw API category (PRODUCT, DELIVERY, etc.)
  uiCategory: InquiryType; // mapped UI label ('상품 문의' etc.)
  message: string;
  responseMessage: string;
  status: InquiryStatus;
  answering: boolean;
}

// Map API categories to UI categories (must match InquiryType)
const mapApiCategoryToUI = (apiCategory: string): InquiryType => {
  switch (apiCategory) {
    case 'PRODUCT':
      return '상품 문의';
    case 'DELIVERY':
      return '배송 문의';
    case 'EXCHANGE_RETURN':
      return '교환/환불 문의';
    case 'PAYMENT':
      return '결제 문의';
    case 'OTHER':
    default:
      return '기타 문의';
  }
};

// Helper function to transform API response to UI format
const transformStoreInquiryToUI = (
  storeInquiry: StoreInquiry
): TransformedInquiry => {
  try {
    const productName =
      storeInquiry.product?.productName ||
      storeInquiry.productName ||
      'Unknown Product';

    const productPrice =
      storeInquiry.product?.discountedPrice ??
      storeInquiry.product?.salePrice ??
      0;

    const productImage =
      constructFileUrl(storeInquiry.product?.productThumbnail) ||
      '/images/products/dogfood.png';

    return {
      id: parseInt(storeInquiry.inquiryId?.split('-')[0], 16) || 0, // Convert UUID segment to number
      inquiryId: storeInquiry.inquiryId,
      date: storeInquiry.createdAt,
      productName,
      productPrice,
      productImage,
      category: storeInquiry.category,
      uiCategory: mapApiCategoryToUI(storeInquiry.category),
      message: storeInquiry.content,
      responseMessage: storeInquiry.answer || '',
      status: storeInquiry.status === 'ANSWERED' ? '답변 완료' : '답변 대기 중',
      answering: false,
    };
  } catch (error) {
    console.error('Error transforming inquiry:', error, storeInquiry);
    return {
      id: 0,
      inquiryId: storeInquiry.inquiryId || 'unknown',
      date: storeInquiry.createdAt || new Date().toISOString(),
      productName: 'Unknown Product',
      productPrice: 0,
      productImage: '/images/products/dogfood.png',
      category: storeInquiry.category || 'OTHER',
      uiCategory: '기타 문의',
      message: storeInquiry.content || 'No content',
      responseMessage: '',
      status: '답변 대기 중',
      answering: false,
    };
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
          size: 100,
        });

        if (response.error || !response.data) {
          console.error('Failed to fetch store inquiries:', response.error);
          setInquiries([]);
        } else {
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
        selectedType === '전체' ? true : q.uiCategory === selectedType;
      return byTab && byType;
    });
  }, [inquiries, tab, selectedType]);

  const handlePick = (t: InquiryType) => {
    setSelectedType(t);
    setOpen(false);
  };

  const handleInquiryClick = (inquiry: TransformedInquiry) => {
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
                    {q.uiCategory}
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
