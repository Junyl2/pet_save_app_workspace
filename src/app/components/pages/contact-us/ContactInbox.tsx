'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContactInquiry } from '@/app/api/types/contact/contact';
import { contactService } from '@/app/api/services/contact-service/contactService';
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await contactService.getAllInquiries();
      setInquiries(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSelectRange = (option: RangeLabel) => {
    setSelectedRange(option);
    setDropdownOpen(false);
  };

  const filteredInquiries = useMemo(() => {
    const now = new Date();
    const byRange = (inq: ContactInquiry) => {
      if (selectedRange === '전체보기') return true;
      const inquiryDate = new Date(inq.date);

      if (selectedRange === '1개월') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return inquiryDate >= oneMonthAgo;
      }
      if (selectedRange === '6개월') {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return inquiryDate >= sixMonthsAgo;
      }
      if (selectedRange === '1년') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return inquiryDate >= oneYearAgo;
      }
      return true;
    };

    return inquiries.filter(byRange);
  }, [inquiries, selectedRange]);

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
        {filteredInquiries.length === 0 ? (
          <div className={styles.emptyInbox}>
            {selectedRange === '전체보기' ? (
              <p>문의 내역이 없습니다. 새로운 문의를 남겨보세요.</p>
            ) : (
              <p>{selectedRange} 동안 문의 내역이 없습니다.</p>
            )}
          </div>
        ) : (
          filteredInquiries.map((inq) => {
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
                router.push(`/inquiries/waiting-reply/${inq.id}`);
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
