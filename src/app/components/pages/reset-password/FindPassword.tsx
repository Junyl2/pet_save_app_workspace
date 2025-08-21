'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';

import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import PasswordResetScreen from './PasswordResetScreen';
import styles from './FindPassword.module.css';
export default function FindPassword() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [confirmedUserId, setConfirmedUserId] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    userId?: string;
  }>({});
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(179);
  const [isVerified, setIsVerified] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  /** Validation */
  const validate = () => {
    const newErrors: { name?: string; email?: string; userId?: string } = {};
    if (!name) newErrors.name = '이름을 입력해 주세요.';
    if (!userId) newErrors.userId = '아이디를 입력해 주세요.';
    if (!email) {
      newErrors.email = '이메일을 입력해 주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '형식에 맞지 않는 이메일입니다.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Send 인증번호 */
  const handleSendCode = async () => {
    if (!validate()) return;
    try {
      const generatedCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      alert(`Hi ${name}! check console log for the dummy code`);
      console.log('API → 인증번호 전송:', generatedCode, 'to:', email);
      setServerCode(generatedCode);
      setShowAuthCode(true);
      setTimeLeft(179);
      setIsVerified(false);
    } catch (err) {
      console.error('인증번호 전송 실패', err);
    }
  };

  /** Verify 인증번호 */
  const handleVerifyCode = async () => {
    if (authCode === serverCode) {
      console.log('API → 인증 성공');
      setIsVerified(true);
    } else {
      console.log('API → 인증 실패');
      setIsVerified(false);
    }
  };

  /** Countdown Timer */
  useEffect(() => {
    if (!showAuthCode || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [showAuthCode, timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /** Submit Main Form */
  const isFormValid =
    name && userId && email && Object.keys(errors).length === 0 && isVerified;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      console.log('API → 최종 아이디 확인 요청:', { name, email });
      setShowModal(true);
    } catch (err) {
      console.error('아이디 확인 실패', err);
    }
  };

  /** Confirm → show AuthenticationComplete */
  const handleConfirm = () => {
    setShowModal(false);
    setShowComplete(true);
    setConfirmedName(name);
    setConfirmedUserId(userId);
    setConfirmedEmail(email);
  };

  //  if authentication is complete, render that component instead
  if (showComplete) {
    return (
      <PasswordResetScreen
        name={confirmedName}
        userId={confirmedUserId}
        email={confirmedEmail}
      />
    );
  }

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
        <h1 className={styles.title}>비밀번호 찾기</h1>
      </div>

      {/* Name Input */}
      <div className={styles.inputGroup}>
        <label>이름</label>
        <input
          type="text"
          placeholder="이름을 입력해 주세요."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={validate}
          className={errors.name ? styles.inputError : styles.inputSuccess}
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}
      </div>

      {/* ID Input */}
      <div className={styles.inputGroup}>
        <label>아이디</label>
        <input
          type="text"
          placeholder="아이디를 입력해주세요."
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onBlur={validate}
          className={errors.userId ? styles.inputError : styles.inputSuccess}
        />
        {errors.userId && <p className={styles.error}>{errors.userId}</p>}
      </div>

      {/* Email Input with Send Button */}
      <div className={styles.inputGroup}>
        <label>이메일</label>
        <div className={styles.inputWithButton}>
          <input
            type="email"
            placeholder="이메일을 입력해 주세요."
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validate();
            }}
            className={errors.email ? styles.inputError : styles.inputSuccess}
            onBlur={validate}
          />
          <button
            type="button"
            onClick={handleSendCode}
            className={styles.inlineButton}
            disabled={!email || !!errors.email}
          >
            인증번호 전송
          </button>
        </div>
        {errors.email && <p className={styles.error}>{errors.email}</p>}
      </div>

      {/* Authentication Code Section */}
      {showAuthCode && (
        <div className={styles.inputGroup}>
          <label>인증번호</label>
          <div className={styles.authContainer}>
            <input
              type="text"
              placeholder="인증번호를 입력해 주세요."
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className={authCode ? styles.authInput : styles.authError}
            />

            <div className={styles.authFooter}>
              <span className={styles.timer}>{formatTime(timeLeft)}</span>
              <button
                type="button"
                className={styles.inlineButton}
                onClick={handleVerifyCode}
                disabled={!authCode}
              >
                인증 확인
              </button>
            </div>
          </div>

          {!isVerified && (
            <p className={styles.error}>휴대전화 인증를 완료해주세요.</p>
          )}
          {isVerified && (
            <p className={styles.success}>인증이 완료되었습니다.</p>
          )}
        </div>
      )}

      {/* Main Submit Button */}
      <button
        type="button"
        className={`${styles.mainButton} ${isFormValid ? styles.enabled : ''}`}
        disabled={!isFormValid}
        onClick={handleSubmit}
      >
        다음
      </button>

      {/* Success Modal */}
      <BaseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="인증 완료"
      >
        <p className={styles.successMessage}>휴대폰 인증이 완료 되었습니다.</p>
        <button className={styles.modalButton} onClick={handleConfirm}>
          확인
        </button>
      </BaseModal>
    </div>
  );
}
