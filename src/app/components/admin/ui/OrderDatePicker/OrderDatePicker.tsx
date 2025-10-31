'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './OrderDatePicker.module.css';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { IoChevronDownOutline } from 'react-icons/io5';
import path from 'path';

export default function OrderDatePicker() {
  const [startDate, setStartDate] = useState('25.04.02');
  const [endDate, setEndDate] = useState('00.00.00');
  const [query, setQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState('전체');
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  const handleSearch = () => {
    console.log(
      `검색: ${startDate} ~ ${endDate} | query="${query}" | option="${selectedOption}"`
    );
    // TODO: call API or filter logic here
  };

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    setOpen(false);
  };

  const allowFiltering =
    pathname === '/admin/pages/order-delivery-management/product-preparation' ||
    pathname ===
      '/admin/pages/order-delivery-management/delivery-pickup-progress' ||
    pathname === '/admin/pages/order-delivery-management/receipt-complete';

  const isGeneralMember = pathname.startsWith(
    '/admin/pages/account-permission-management/general-member/regular-member'
  );

  return (
    <>
      {!isGeneralMember && (
        <div className={styles.container}>
          {/* Left: Dropdown (only on product preparation page) */}
          {allowFiltering && (
            <div className={styles.dropdownWrapper}>
              <div
                className={styles.dropdownHeader}
                onClick={() => setOpen((prev) => !prev)}
              >
                <span>{selectedOption}</span>
                <IoChevronDownOutline className={styles.dropdownIcon} />
              </div>
              {open && (
                <div className={styles.dropdownList}>
                  {['전체', '배송', '픽업'].map((option) => (
                    <div
                      key={option}
                      className={styles.dropdownItem}
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Date range */}
          <div className={styles.dateRange}>
            <div className={styles.dateInput}>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.inputField}
                aria-label="시작일"
              />
              <FaRegCalendarAlt className={styles.calendarIcon} aria-hidden />
            </div>

            <span className={styles.tilde}>~</span>

            <div className={styles.dateInput}>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.inputField}
                aria-label="종료일"
              />
              <FaRegCalendarAlt className={styles.calendarIcon} aria-hidden />
            </div>
          </div>

          {/* Text search */}
          <div className={styles.searchBox}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
              placeholder="검색어를 입력하세요"
              aria-label="검색어"
            />
          </div>

          {/* Button */}
          <button
            type="button"
            className={styles.searchButton}
            onClick={handleSearch}
          >
            검색
          </button>
        </div>
      )}
    </>
  );
}
