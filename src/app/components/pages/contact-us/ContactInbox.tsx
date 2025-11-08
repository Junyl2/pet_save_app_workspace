'use client';

import { useEffect, useState, useCallback } from 'react';
import { ContactInquiry } from '@/app/api/types/contact/contact';
import { contactService } from '@/app/api/services/contact-service/contactService';
import { MemberInquiryService } from '@/app/api/services/client/memberService/inquiry-details/memberInquiryService';
import { MyInquiry } from '@/app/api/types/member/inquiry-details/inquiry';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import ContactInboxSkeleton from '../../ui/SkeletonLoading/ContactInboxSkeleton/ContactInboxSkeleton';
import styles from './ContactInbox.module.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { DotMenu } from '../../ui/DotMenu/DotMenu';
import { useRouter } from 'next/navigation';
import ClientPagination from '@/app/components/admin/ui/ClientPagination/ClientPagination';

type RangeLabel = '1개월' | '6개월' | '1년' | '전체보기';

type ContactInboxProps = {
  hideMenu?: boolean;
  extraActionsRender?: React.ReactNode;
  initialRange?: RangeLabel;
};

const PAGE_SIZE = 10;

// Convert API response type to ContactInquiry
const transformMyInquiryToContactInquiry = (
  myInquiry: MyInquiry
): ContactInquiry => ({
  id: parseInt(myInquiry.inquiryId.split('-')[0], 16) || 0,
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
  const [currentPage, setCurrentPage] = useState(1); // 1-based
  const [totalPages, setTotalPages] = useState(1);

  const rangeOptions: RangeLabel[] = ['1개월', '6개월', '1년', '전체보기'];

  const getDateRangeParams = (range: RangeLabel) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (range) {
      case '1개월': {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 1);
        return { dateStart: d.toISOString().split('T')[0], dateEnd: today };
      }
      case '6개월': {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 6);
        return { dateStart: d.toISOString().split('T')[0], dateEnd: today };
      }
      case '1년': {
        const d = new Date(now);
        d.setFullYear(now.getFullYear() - 1);
        return { dateStart: d.toISOString().split('T')[0], dateEnd: today };
      }
      default:
        return {};
    }
  };

  const fetchInquiries = useCallback(
    async (range: RangeLabel, page: number) => {
      setLoading(true);
      try {
        const dateParams = getDateRangeParams(range);
        const response = await MemberInquiryService.getMyInquiries({
          ...dateParams,
          page: page - 1, // zero-based for API
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
        });

        if (response.error || !response.data) {
          const mockData = await contactService.getAllInquiries();
          setInquiries(mockData);
          setTotalPages(1);
        } else {
          const transformed = response.data.data.content.map(
            transformMyInquiryToContactInquiry
          );
          setInquiries(transformed);
          setTotalPages(response.data.data.pageInfo?.totalPages ?? 1);
        }
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        const mockData = await contactService.getAllInquiries();
        setInquiries(mockData);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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

      {/* Top toolbar */}
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
            <span
              className={`${styles.dropdownLabel} ${
                selectedRange ? styles.selected : ''
              }`}
            >
              {selectedRange}
            </span>
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

      {/* Inquiries List */}
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
                setInquiries((prev) => prev.filter((i) => i.id !== inq.id));
              }
            };

            return (
              <div
                key={inq.id}
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
