'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronDown } from 'react-icons/fa';
import styles from './SellerInquiryDetails.module.css';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import BottomBar from '../../sections/BottomBar/BottomBar';
import { useUser } from '@/app/context/userContext';
import { MemberStoreService } from '@/app/api/services/client/memberService/memberStore/memberStoreService';
import { StoreInquiry } from '@/app/api/types/member/store/storeInquiry';
import { baseURL } from '@/app/api/config';
import ClientPagination from '@/app/components/admin/ui/ClientPagination/ClientPagination';

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

const PAGE_SIZE = 10;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const constructFileUrl = (fileId: string | null | undefined): string => {
  if (!fileId) return '/images/products/dogfood.png';
  if (fileId.startsWith('http')) return fileId;
  if (fileId.startsWith('/')) return fileId;
  return `${baseURL}/files/${fileId}`;
};

interface TransformedInquiry {
  id: number;
  inquiryId: string;
  date: string;
  productName: string;
  productPrice: number;
  productImage: string;
  category: string;
  uiCategory: InquiryType;
  message: string;
  responseMessage: string;
  status: InquiryStatus;
  answering: boolean;
}

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
    default:
      return '기타 문의';
  }
};

const transformStoreInquiryToUI = (
  storeInquiry: StoreInquiry
): TransformedInquiry => {
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
    id: parseInt(storeInquiry.inquiryId?.split('-')[0], 16) || 0,
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
};

export default function SellerInquiryDetails() {
  const router = useRouter();
  const { user } = useUser();

  const [tab, setTab] = useState<InquiryStatus>('답변 대기 중');
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<InquiryType>('전체');
  const ddRef = useRef<HTMLDivElement | null>(null);

  const [inquiries, setInquiries] = useState<TransformedInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect non-sellers
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'seller' || !user.storeId) {
      router.push('/client/pages/homepage');
    }
  }, [user, user?.role, user?.storeId, router]);

  // Fetch inquiries
  useEffect(() => {
    if (!user || user.role !== 'seller' || !user.storeId) return;

    const fetchInquiries = async (): Promise<void> => {
      setLoading(true);
      setInquiries([]);

      try {
        const statusParam = tab === '답변 완료' ? 'ANSWERED' : 'WAITING';

        const response = await MemberStoreService.getMyStoreInquiries({
          page: currentPage - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
          status: statusParam,
        });

        if (response.error || !response.data) {
          console.error('Failed to fetch store inquiries:', response.error);
          setInquiries([]);
          setTotalPages(1);
          return;
        }

        const transformed = response.data.data.content.map(
          transformStoreInquiryToUI
        );
        setInquiries(transformed);
        setTotalPages(response.data.data.pageInfo?.totalPages ?? 1);
      } catch (error) {
        console.error('Error fetching store inquiries:', error);
        setInquiries([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    void fetchInquiries();
  }, [user, user?.role, user?.storeId, currentPage, tab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    return inquiries.filter((q) =>
      selectedType === '전체' ? true : q.uiCategory === selectedType
    );
  }, [inquiries, selectedType]);

  const handlePick = (t: InquiryType) => {
    setSelectedType(t);
    setOpen(false);
  };

  const handleInquiryClick = (inquiry: TransformedInquiry) => {
    router.push(`/client/seller/pages/reply-inquiry?id=${inquiry.inquiryId}`);
  };

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
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${
              tab === '답변 대기 중' ? styles.active : ''
            }`}
            onClick={() => {
              setTab('답변 대기 중');
              setCurrentPage(1);
            }}
          >
            답변대기
          </button>
          <button
            className={`${styles.tabBtn} ${
              tab === '답변 완료' ? styles.active : ''
            }`}
            onClick={() => {
              setTab('답변 완료');
              setCurrentPage(1);
            }}
          >
            답변완료
          </button>
        </div>

        {/* Filter */}
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

        {/* Inquiry list */}
        <div className={styles.list}>
          {filtered.length === 0 && (
            <div className={styles.empty}>해당 조건의 문의가 없습니다.</div>
          )}

          {filtered.map((q) => (
            <article
              key={q.inquiryId}
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
                  <img src={q.productImage} alt="" className={styles.thumb} />
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <ClientPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      <BottomBar />
    </>
  );
}
