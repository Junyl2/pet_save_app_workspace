'use client';

import { useEffect, useMemo, useState } from 'react';
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
/* import toast from 'react-hot-toast'; */

type RangeLabel = '1개월' | '6개월' | '1년' | '전체보기';

type ContactInboxProps = {
  hideMenu?: boolean;
  extraActionsRender?: React.ReactNode;
  initialRange?: RangeLabel;
};

// Helper function to transform API response to ContactInquiry format
const transformMyInquiryToContactInquiry = (
  myInquiry: MyInquiry
): ContactInquiry => {
  return {
    id: parseInt(myInquiry.inquiryId.split('-')[0], 16) || 0, // Convert UUID to number for compatibility
    date: myInquiry.createdAt,
    shopName: myInquiry.store.name,
    shopLocation: myInquiry.store.address,
    shopImage: myInquiry.store.profileUrl || '/images/shops/shop1.png', // fallback image
    category: myInquiry.category,
    message: myInquiry.content,
    responseMessage: myInquiry.answer || '',
    status: myInquiry.status === 'ANSWERED' ? '답변 완료' : '답변 대기 중',
    productId: myInquiry.product.productId, // Store productId for routing
  };
};

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
  const rangeOptions: RangeLabel[] = ['1개월', '6개월', '1년', '전체보기'];

  // Helper function to get date range parameters
  const getDateRangeParams = (range: RangeLabel) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log('📅 Current date:', today);

    switch (range) {
      case '1개월': {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const dateStart = oneMonthAgo.toISOString().split('T')[0];
        console.log('📅 1개월 range:', { dateStart, dateEnd: today });
        return { dateStart, dateEnd: today };
      }
      case '6개월': {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const dateStart = sixMonthsAgo.toISOString().split('T')[0];
        console.log('📅 6개월 range:', { dateStart, dateEnd: today });
        return { dateStart, dateEnd: today };
      }
      case '1년': {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        const dateStart = oneYearAgo.toISOString().split('T')[0];
        console.log('📅 1년 range:', { dateStart, dateEnd: today });
        return { dateStart, dateEnd: today };
      }
      case '전체보기':
      default:
        console.log('📅 전체보기 - no date filtering');
        return {}; // No date filtering for 전체보기
    }
  };

  const fetchInquiries = async (range: RangeLabel) => {
    setLoading(true);
    try {
      const dateParams = getDateRangeParams(range);

      console.log(
        '🔍 Fetching inquiries for range:',
        range,
        'with date params:',
        dateParams
      );

      // Use the new API to get inquiries with date filtering
      const response = await MemberInquiryService.getMyInquiries({
        ...dateParams,
        sortBy: 'createdAt',
        direction: 'desc',
        size: 100, // Get more items to ensure we have all data for the range
      });

      if (response.error || !response.data) {
        console.error('Failed to fetch inquiries:', response.error);
        // Fallback to mock data if API fails
        const mockData = await contactService.getAllInquiries();
        setInquiries(mockData);
      } else {
        // Transform API response to ContactInquiry format
        const transformedInquiries = response.data.data.content.map(
          transformMyInquiryToContactInquiry
        );

        console.log(
          '📅 Raw API data dates:',
          response.data.data.content.map((inq) => ({
            inquiryId: inq.inquiryId,
            createdAt: inq.createdAt,
            date: new Date(inq.createdAt).toLocaleDateString('ko-KR'),
          }))
        );

        console.log(
          '📅 Transformed inquiries dates:',
          transformedInquiries.map((inq) => ({
            id: inq.id,
            date: inq.date,
            formattedDate: new Date(inq.date).toLocaleDateString('ko-KR'),
          }))
        );

        // Apply client-side filtering as backup in case API filtering doesn't work
        const clientFilteredInquiries = applyClientSideDateFilter(
          transformedInquiries,
          range
        );

        console.log(
          '🔍 Client-side filtered count:',
          clientFilteredInquiries.length,
          'out of',
          transformedInquiries.length
        );

        setInquiries(clientFilteredInquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      // Fallback to mock data on error
      const mockData = await contactService.getAllInquiries();
      setInquiries(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Client-side date filtering as backup
  const applyClientSideDateFilter = (
    inquiries: ContactInquiry[],
    range: RangeLabel
  ): ContactInquiry[] => {
    if (range === '전체보기') return inquiries;

    const now = new Date();
    const inquiryDate = (inq: ContactInquiry) => new Date(inq.date);

    switch (range) {
      case '1개월': {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return inquiries.filter((inq) => inquiryDate(inq) >= oneMonthAgo);
      }
      case '6개월': {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return inquiries.filter((inq) => inquiryDate(inq) >= sixMonthsAgo);
      }
      case '1년': {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return inquiries.filter((inq) => inquiryDate(inq) >= oneYearAgo);
      }
      default:
        return inquiries;
    }
  };

  useEffect(() => {
    fetchInquiries(selectedRange);
  }, [selectedRange]);

  const handleSelectRange = (option: RangeLabel) => {
    setSelectedRange(option);
    setDropdownOpen(false);
    // The useEffect will automatically trigger a new API call with the selected range
  };

  if (loading) return <ContactInboxSkeleton />;

  return (
    <>
      <ProductHeader />

      {/* Top toolbar: extra actions + period dropdown */}
      <div className={styles.topToolbar}>
        {extraActionsRender ? (
          <div className={styles.extraActions}>{extraActionsRender}</div>
        ) : null}

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
            }).format(new Date(inq.date)); // e.g., 25.07.30

            const handleCardClick = () => {
              if (dropdownOpen) return; // prevent accidental clicks while dropdown open
              // add a shared state if needed for modal open
              if (isCompleted) {
                router.push(
                  `/client/pages/my-page/history-inquiry/reply/${inq.id}`
                );
              } else {
                // Use productId for waiting reply page routing
                const productId = inq.productId || inq.id.toString();
                router.push(`/inquiries/waiting-reply/${productId}`);
              }
            };

            /*    const handleConfirmDelete = async () => {
              await contactService.deleteInquiry(inq.id);
              setInquiries((prev) => prev.filter((i) => i.id !== inq.id));
            }; */

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
                {/* prevent menu click from triggering card click */}
                {!hideMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={styles.dotMenu}
                  >
                    <DotMenu mode="deletePage" />
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
      </div>
    </>
  );
}
