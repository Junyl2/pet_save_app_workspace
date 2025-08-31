'use client';

import { useEffect, useState } from 'react';
import { ContactInquiry } from '@/app/api/types/contact/contact';
import { contactService } from '@/app/api/services/contact-service/contactService';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import ContactInboxSkeleton from '../../ui/SkeletonLoading/ContactInboxSkeleton/ContactInboxSkeleton';
import styles from './ContactInbox.module.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { DotMenu } from '../../ui/DotMenu/DotMenu';
import { useRouter } from 'next/navigation';

export default function ContactInbox() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState('1개월');

  const options = ['6개월', '1년', '전체보기'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await contactService.getAllInquiries();
      setInquiries(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSelect = (option: string) => {
    setSelected(option);
    setDropdownOpen(false);
  };

  // filtering logic
  const filteredInquiries = inquiries.filter((inq) => {
    if (selected === '전체보기') return true;

    const inquiryDate = new Date(inq.date);
    const now = new Date();

    if (selected === '1개월') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return inquiryDate >= oneMonthAgo;
    }
    if (selected === '6개월') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      return inquiryDate >= sixMonthsAgo;
    }
    if (selected === '1년') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return inquiryDate >= oneYearAgo;
    }

    return true;
  });

  if (loading) return <ContactInboxSkeleton />;

  return (
    <>
      <ProductHeader />

      {/* Dropdown container */}
      <div className={styles.dropdownContainer}>
        <button
          className={`${styles.dropdownToggle} ${
            dropdownOpen ? styles.open : ''
          }`}
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <span
            className={`${styles.dropdownLabel} ${
              selected ? styles.selected : ''
            }`}
          >
            {selected}
          </span>
          {dropdownOpen ? (
            <FaChevronUp className={styles.dropdownArrow} />
          ) : (
            <FaChevronDown className={styles.dropdownArrow} />
          )}
        </button>
        {dropdownOpen && (
          <ul className={styles.dropdownMenu}>
            {options.map((option) => (
              <li
                key={option}
                className={`${styles.dropdownItem} ${
                  selected === option ? styles.selected : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.container}>
        {filteredInquiries.length === 0 ? (
          <div className={styles.emptyInbox}>
            {selected === '전체보기' ? (
              <p>문의 내역이 없습니다. 새로운 문의를 남겨보세요.</p>
            ) : (
              <p>{selected} 동안 문의 내역이 없습니다.</p>
            )}
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const formattedDate = new Intl.DateTimeFormat('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(new Date(inq.date));

            return (
              <div key={inq.id} className={styles.inquiryCard}>
                <DotMenu
                  mode="deleteOnly"
                  onDelete={() => router.push(`/inquiries/delete/${inq.id}`)}
                />

                <p className={styles.status}>
                  <span
                    className={
                      inq.status === '답변 완료'
                        ? styles.completed
                        : styles.pending
                    }
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
