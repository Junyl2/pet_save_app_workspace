'use client';

import React, { useState } from 'react';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './WithdrawalConfirmation.module.css';
import toast from 'react-hot-toast';
import { SecureService } from '@/app/api/services/client/auth/secureService';

const WithdrawalConfirmation = () => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [password, setPassword] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomReason, setIsCustomReason] = useState(false);

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
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOptionSelect = (option: string) => {
    setIsDropdownOpen(false);
    if (option === '기타 (직접 입력)') {
      setIsCustomReason(true);
      setReason(option);
      setCustomReason('');
    } else {
      setIsCustomReason(false);
      setReason(option);
      setCustomReason('');
    }
  };

  const handleWithdrawal = async () => {
    const finalReason = isCustomReason ? customReason.trim() : reason;

    if (!finalReason || !password) {
      toast.error('탈퇴 사유와 비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await SecureService.withdrawMember({
        withdrawalReason: finalReason,
        password,
      });

      if (res.error) {
        toast.error(res.error);
      } else if (res.data?.success) {
        toast.success('회원 탈퇴가 완료되었습니다.');
        localStorage.clear();
        window.location.href = '/';
      } else {
        toast.error(res.data?.resultMsg || '회원 탈퇴에 실패했습니다.');
      }
    } catch (err) {
      console.error('Withdrawal failed:', err);
      toast.error('탈퇴 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.iconContainer}>
            <div className={styles.trashIcon}>
              <img
                src="/images/icons/trash.svg"
                alt="Trash"
                width={49}
                height={57}
              />
            </div>
            <h1 className={styles.title}>정말 탈퇴하시겠어요?</h1>
          </div>

          {/* Reason dropdown */}
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
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 10L12 15L17 10"
                      stroke="rgba(0, 0, 0, 0.6)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {isDropdownOpen && (
                  <div className={styles.dropdownOptions}>
                    {dropdownOptions.map((option) => (
                      <div
                        key={option}
                        className={`${styles.dropdownOption} ${
                          reason === option ? styles.dropdownOptionSelected : ''
                        }`}
                        onClick={() => handleOptionSelect(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom input field (visible only for "기타") */}
            {isCustomReason && (
              <div className={styles.formGroup}>
                <input
                  type="text"
                  className={styles.customReasonInput}
                  placeholder="탈퇴 사유를 입력하세요"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Password input */}
          <div className={styles.passwordSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>비밀번호 입력</label>
              <input
                type="password"
                className={styles.passwordInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Info */}
          <div className={styles.infoSection}>
            <div className={styles.infoTitleWrapper}>
              <h3 className={styles.infoTitle}>탈퇴 전 유의사항</h3>
            </div>
            <ul className={styles.infoList}>
              <li>탈퇴 후 7일간 재가입이 불가능합니다.</li>
              <li>
                탈퇴 시 계정의 모든 정보는 삭제되며 재가입 시에도 복구되지
                않습니다.
              </li>
            </ul>
          </div>

          {/* Submit button */}
          <div className={styles.buttonContainer}>
            <button
              className={styles.withdrawButton}
              onClick={handleWithdrawal}
              disabled={
                isSubmitting ||
                !password ||
                (!isCustomReason && !reason) ||
                (isCustomReason && !customReason.trim())
              }
            >
              {isSubmitting ? '처리 중...' : '탈퇴하기'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithdrawalConfirmation;
