'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaEnvelope, FaMobile } from 'react-icons/fa';
import styles from './SelectVerification.module.css';
import { usePathname } from 'next/navigation';

export default function SelectVerification() {
  const router = useRouter();
  const pathname = usePathname();

  const isResetPasswordPage = pathname.includes('/client/reset-password');

  const [selectedMethod, setSelectedMethod] = useState<
    'email' | 'phone' | null
  >(null);

  const handleMethodSelect = (method: 'email' | 'phone') => {
    setSelectedMethod(method);
  };

  const isFindIdPage = pathname.includes('/client/find-id');

  const handleNext = () => {
    if (selectedMethod === 'email') {
      if (isFindIdPage) {
        router.push('/client/find-id/find-id-email');
      } else {
        router.push('/client/reset-password/reset-password-email');
      }
    } else if (selectedMethod === 'phone') {
      if (isFindIdPage) {
        router.push('/client/find-id/find-id-phone');
      } else {
        router.push('/client/reset-password/reset-password-phone');
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
        >
          <FaChevronLeft className={styles.backIcon} />
        </button>

        {isResetPasswordPage ? (
          <h1 className={styles.title}>비밀번호 찾기</h1>
        ) : (
          <h1 className={styles.title}>아이디 찾기</h1>
        )}
      </div>

      {/* Verification Options */}
      <div className={styles.optionsContainer}>
        {/* Email Option */}
        <div
          className={`${styles.optionCard} ${
            selectedMethod === 'email' ? styles.selected : ''
          }`}
          onClick={() => handleMethodSelect('email')}
        >
          <div className={styles.optionContent}>
            <div className={styles.iconContainer}>
              <FaEnvelope className={styles.icon} />
            </div>
            <div className={styles.textContent}>
              <h3 className={styles.optionTitle}>이메일로 인증</h3>
              <p className={styles.optionDescription}>
                가입 시 등록한 이메일로 인증번호를 받습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Phone Option */}
        <div
          className={`${styles.optionCard} ${
            selectedMethod === 'phone' ? styles.selected : ''
          }`}
          onClick={() => handleMethodSelect('phone')}
        >
          <div className={styles.optionContent}>
            <div className={styles.iconContainer}>
              <FaMobile className={styles.icon} />
            </div>
            <div className={styles.textContent}>
              <h3 className={styles.optionTitle}>휴대폰으로 인증</h3>
              <p className={styles.optionDescription}>
                휴대폰 번호로 인증번호(SMS)를 받습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <button
        type="button"
        className={`${styles.nextButton} ${
          selectedMethod ? styles.enabled : ''
        }`}
        disabled={!selectedMethod}
        onClick={handleNext}
      >
        다음
      </button>
    </div>
  );
}
