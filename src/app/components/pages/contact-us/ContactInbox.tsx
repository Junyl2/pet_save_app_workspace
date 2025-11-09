'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { ContactInquiry } from '@/app/api/types/contact/contact';
import { MyInquiry } from '@/app/api/types/member/inquiry-details/inquiry';
import { MemberInquiryService } from '@/app/api/services/client/memberService/inquiry-details/memberInquiryService';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import ContactInboxSkeleton from '../../ui/SkeletonLoading/ContactInboxSkeleton/ContactInboxSkeleton';
import ClientPagination from '@/app/components/admin/ui/ClientPagination/ClientPagination';
import { DotMenu } from '../../ui/DotMenu/DotMenu';
import styles from './ContactInbox.module.css';

type RangeLabel = '1개월' | '6개월' | '1년' | '전체보기';

interface ContactInboxProps {
  hideMenu?: boolean;
  extraActionsRender?: React.ReactNode;
  initialRange?: RangeLabel;
}

const PAGE_SIZE = 10;

/** Normalize API inquiry → UI inquiry */
const transformMyInquiryToContactInquiry = (
  myInquiry: MyInquiry
): ContactInquiry => ({
  id: myInquiry.inquiryId,
  inquiryId: myInquiry.inquiryId,
  date: myInquiry.createdAt,
  shopName: myInquiry.store.name,
  shopLocation: myInquiry.store.address,
  shopImage: myInquiry.store.profileUrl || '/images/shops/shop1.png',
  category: myInquiry.category,
  message: myInquiry.content,
  responseMessage: myInquiry.answer || '',
  status: myInquiry.status === 'ANSWERED' ? '답변 완료' : '답변 대기 중',
  productId: myInquiry.product.productId,
});

export default function ContactInbox({
  hideMenu = false,
  extraActionsRender,
  initialRange = '1개월',
}: ContactInboxProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<RangeLabel>(initialRange);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<
    'EXCHANGE_RETURN' | 'PRODUCT' | 'DELIVERY' | 'PAYMENT' | 'OTHER' | undefined
  >(undefined);
  const [selectedStatus, setSelectedStatus] = useState<
    'WAITING' | 'ANSWERED' | undefined
  >(undefined);

  const rangeOptions: RangeLabel[] = ['1개월', '6개월', '1년', '전체보기'];

  /** Always return explicit params for the selected range */
  const getDateRangeParams = useCallback((range: RangeLabel) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const getPastDate = (monthsAgo: number): string => {
      const d = new Date(now);
      d.setMonth(now.getMonth() - monthsAgo);
      return d.toISOString().split('T')[0];
    };

    if (range === '1개월') {
      return { dateStart: getPastDate(1), dateEnd: today };
    }
    if (range === '6개월') {
      return { dateStart: getPastDate(6), dateEnd: today };
    }
    if (range === '1년') {
      const d = new Date(now);
      d.setFullYear(now.getFullYear() - 1);
      return { dateStart: d.toISOString().split('T')[0], dateEnd: today };
    }
    // 전체보기
    return { dateStart: undefined, dateEnd: undefined };
  }, []);

  /** Fetch inquiries with date + pagination */
  const fetchInquiries = useCallback(
    async (range: RangeLabel, page: number) => {
      setLoading(true);
      try {
        const { dateStart, dateEnd } = getDateRangeParams(range);
        const params = {
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          dateStart,
          dateEnd,
          page: page - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc' as const,
        };

        console.log('[ContactInbox] Fetching inquiries with params:', params);

        const response = await MemberInquiryService.getMyInquiries(params);

        if (response.error || !response.data) {
          console.warn(
            '[ContactInbox] Failed to fetch inquiries:',
            response.error
          );
          setInquiries([]);
          setTotalPages(1);
        } else {
          const content = response.data.data.content.map(
            transformMyInquiryToContactInquiry
          );
          setInquiries(content);
          setTotalPages(response.data.data.pageInfo?.totalPages ?? 1);
        }
      } catch (error) {
        console.error('[ContactInbox] Error fetching inquiries:', error);
        setInquiries([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [getDateRangeParams, selectedCategory, selectedStatus]
  );

  /** Re-fetch when date range or page changes */
  useEffect(() => {
    fetchInquiries(selectedRange, currentPage);
  }, [selectedRange, currentPage, fetchInquiries]);

  const handleSelectRange = (option: RangeLabel) => {
    setSelectedRange(option);
    setCurrentPage(1);
    setDropdownOpen(false);
  };

  if (loading) return <ContactInboxSkeleton />;

  return (
    <>
      <ProductHeader />

      {/* Toolbar */}
      <div className={styles.topToolbar}>
        {extraActionsRender && (
          <div className={styles.extraActions}>{extraActionsRender}</div>
        )}

        <div className={styles.dropdownContainer}>
          <button
            className={`${styles.dropdownToggle} ${
              dropdownOpen ? styles.open : ''
            }`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span className={styles.dropdownLabel}>{selectedRange}</span>
            {dropdownOpen ? (
              <FaChevronUp className={styles.dropdownArrow} />
            ) : (
              <FaChevronDown className={styles.dropdownArrow} />
            )}
          </button>

          {dropdownOpen && (
            <ul className={styles.dropdownMenu} role="listbox">
              {rangeOptions.map((option) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={selectedRange === option}
                  className={`${styles.dropdownItem} ${
                    selectedRange === option ? styles.selected : ''
                  }`}
                  onClick={() => handleSelectRange(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Inquiry List */}
      <div className={styles.container}>
        {inquiries.length === 0 ? (
          <div className={styles.emptyInbox}>
            {selectedRange === '전체보기' ? (
              <p>문의 내역이 없습니다. 새로운 문의를 남겨보세요.</p>
            ) : (
              <p>{selectedRange} 동안 문의 내역이 없습니다.</p>
            )}
          </div>
        ) : (
          inquiries.map((inq) => {
            const isCompleted = inq.status === '답변 완료';
            const formattedDate = new Intl.DateTimeFormat('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            }).format(new Date(inq.date));

            const handleCardClick = () => {
              if (isCompleted) {
                router.push(
                  `/client/pages/my-page/history-inquiry/reply/${inq.inquiryId}`
                );
              } else {
                router.push(`/inquiries/waiting-reply/${inq.productId}`);
              }
            };

            const handleConfirmDelete = async () => {
              if (!inq.inquiryId) return;
              const res = await MemberInquiryService.deleteInquiry(
                inq.inquiryId
              );
              if (!res.error) {
                setInquiries((prev) =>
                  prev.filter((i) => i.inquiryId !== inq.inquiryId)
                );
              }
            };

            return (
              <div
                key={inq.inquiryId}
                className={`${styles.inquiryCard} ${styles.clickable}`}
                role="button"
                tabIndex={0}
                onClick={handleCardClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
              >
                {!hideMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={styles.dotMenu}
                  >
                    <DotMenu mode="deletePage" onDelete={handleConfirmDelete} />
                  </div>
                )}

                <p className={styles.status}>
                  <span
                    className={isCompleted ? styles.completed : styles.pending}
                  >
                    {inq.status}
                  </span>{' '}
                  <span className={styles.date}>{formattedDate}</span>
                </p>

                <p className={styles.shopInfo}>{inq.shopName}</p>
                <p>{inq.category}</p>
                <p className={styles.message}>{inq.message}</p>
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <ClientPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
