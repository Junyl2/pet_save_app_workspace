'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SellerInquiryDetails.module.css';
import { FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';
import { mockContactInquiries } from '../../data/mockContact';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import BottomBar from '../../sections/BottomBar/BottomBar';
import { useUser } from '@/app/context/userContext';

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

export default function SellerInquiryDetails() {
  const router = useRouter();
  const { user } = useUser();

  // tabs
  const [tab, setTab] = useState<InquiryStatus>('답변 대기 중');

  // dropdown
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<InquiryType>('전체');
  const ddRef = useRef<HTMLDivElement | null>(null);

  // Check if user is approved seller
  useEffect(() => {
    if (user?.role !== 'seller' || !user?.storeId) {
      router.push('/client/pages/homepage');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    return mockContactInquiries.filter((q) => {
      const byTab = q.status === tab;
      const byType =
        selectedType === '전체' ? true : q.category === selectedType;
      return byTab && byType;
    });
  }, [tab, selectedType]);

  const handlePick = (t: InquiryType) => {
    setSelectedType(t);
    setOpen(false);
  };

  const handleInquiryClick = (inquiryId: number) => {
    router.push(`/client/seller/pages/reply-inquiry?id=${inquiryId}`);
  };

  if (!user || user.role !== 'seller' || !user.storeId) {
    return null; // Will redirect in useEffect
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
              onClick={() => handleInquiryClick(q.id)}
              style={{ cursor: 'pointer' }}
            >
              <header className={styles.cardHead}>
                <div className={styles.headLeft}>
                  <span className={styles.headType}>
                    {q.category}
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
                    src={q.shopImage || '/images/products/dogfood.png'}
                    alt=""
                    width={60}
                    height={60}
                    className={styles.thumb}
                    unoptimized
                  />
                </div>
                <div className={styles.meta}>
                  <div className={styles.title}>{q.shopName}</div>
                  <div className={styles.price}>{q.shopLocation}</div>
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
