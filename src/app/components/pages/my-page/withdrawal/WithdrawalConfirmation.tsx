'use client';

import React, { useState } from 'react';
/* import { useRouter } from 'next/navigation'; */
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './WithdrawalConfirmation.module.css';
/* import { PAGE_URLS } from '@/app/utils/page_url'; */

const WithdrawalConfirmation = () => {
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  /*  const router = useRouter(); */

  const handleWithdrawal = () => {
    // Handle withdrawal logic here
    console.log('Withdrawal requested with reason:', reason);
    console.log('Password confirmation:', password);

    // Add API call here for actual withdrawal
    // Add your withdrawal API logic here
  };

  const dropdownOptions = [
    '자주 이용하지 않아요',
    '찾는 상품이 없어요',
    '배송/픽업이 불편해요',
    '교환/반품 과정이 번거로워요',
    '앱 사용이 불편하고 오류가 많아요',
    '다른 쇼핑몰을 이용하고 있어요',
    '기타 (직접 입력)',
  ];

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option: string) => {
    setReason(option);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Header section with icon and title */}
          <div className={styles.iconContainer}>
            <div className={styles.trashIcon}>
              <img
                src="/images/icons/trash.svg"
                alt="Trash"
                width={60}
                height={60}
              />{' '}
            </div>
            <h1 className={styles.title}>정말 탈퇴하시겠어요?</h1>
          </div>

          {/* Reason dropdown section */}
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <div className={styles.customDropdown}>
                <div
                  className={`${styles.dropdownButton} ${
                    isDropdownOpen ? styles.dropdownButtonOpen : ''
                  }`}
                  onClick={handleDropdownToggle}
                >
                  <span className={styles.dropdownText}>
                    {reason || '탈퇴 사유 선택'}
                  </span>
                  <svg
                    className={`${styles.dropdownArrow} ${
                      isDropdownOpen ? styles.dropdownArrowOpen : ''
                    }`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {isDropdownOpen && (
                  <div className={styles.dropdownOptions}>
                    {dropdownOptions.map((option, index) => (
                      <div
                        key={index}
                        className={styles.dropdownOption}
                        onClick={() => handleOptionSelect(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className={styles.separator} />

          {/* Password section */}
          <div className={styles.passwordSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>비밀번호 입력</label>
              <input
                type="password"
                className={styles.passwordInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
              />
            </div>
          </div>

          <hr className={styles.separator} />

          {/* Information section */}
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>탈퇴 전 유의사항</h3>
            <ul className={styles.infoList}>
              <li>탈퇴 후 7일간 재가입이 불가능합니다.</li>
              <li>
                탈퇴 시 계정의 모든 정보는 삭제되며 재가입 시에도 복구되지
                않습니다.
              </li>
            </ul>
          </div>

          {/* Spacer to push button to bottom */}
          <div className={styles.spacer}></div>

          {/* Withdrawal button */}
          <div className={styles.buttonContainer}>
            <button
              className={styles.withdrawButton}
              onClick={handleWithdrawal}
              disabled={!reason || !password}
            >
              탈퇴하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithdrawalConfirmation;
