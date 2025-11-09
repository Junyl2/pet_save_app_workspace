'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './OrderDatePicker.module.css';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { IoChevronDownOutline } from 'react-icons/io5';
import { useOrderFilter } from '@/app/context/orderFilterContext';

export default function OrderDatePicker() {
  const pathname = usePathname();
  const {
    filters,
    setDateStart,
    setDateEnd,
    setKeyword,
    setShippingOption,
    applyFilters,
  } = useOrderFilter();

  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');
  const [localQuery, setLocalQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState('전체');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalStartDate(filters.dateStart || '');
    setLocalEndDate(filters.dateEnd || '');
    setLocalQuery(filters.keyword || '');
    if (filters.shippingOption === 'DELIVERY') {
      setSelectedOption('배송');
    } else if (filters.shippingOption === 'PICKUP') {
      setSelectedOption('픽업');
    } else {
      setSelectedOption('전체');
    }
  }, [filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleSearch = () => {
    setDateStart(localStartDate || null);
    setDateEnd(localEndDate || null);
    setKeyword(localQuery.trim() || null);

    if (selectedOption === '배송') {
      setShippingOption('DELIVERY');
    } else if (selectedOption === '픽업') {
      setShippingOption('PICKUP');
    } else {
      setShippingOption(null);
    }

    applyFilters();
  };

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    setOpen(false);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEndDate(e.target.value);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
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
          {/* Left: Dropdown (only on specific pages) */}
          {allowFiltering && (
            <div className={styles.dropdownWrapper} ref={dropdownRef}>
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
                type="date"
                value={localStartDate}
                onChange={handleStartDateChange}
                className={styles.inputField}
                aria-label="시작일"
              />
              <FaRegCalendarAlt className={styles.calendarIcon} aria-hidden />
            </div>

            <span className={styles.tilde}>~</span>

            <div className={styles.dateInput}>
              <input
                type="date"
                value={localEndDate}
                onChange={handleEndDateChange}
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
              value={localQuery}
              onChange={handleQueryChange}
              className={styles.searchInput}
              placeholder="검색어를 입력하세요"
              aria-label="검색어"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
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
