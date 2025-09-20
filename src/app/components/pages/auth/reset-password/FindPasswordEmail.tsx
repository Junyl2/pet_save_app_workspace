'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';

import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import PasswordResetScreen from './PasswordResetScreen';
import { AuthService } from '@/app/api/services/client/auth/authService';
import styles from './FindPassword.module.css';
export default function FindPasswordEmail() {
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
  const [showModal, setShowModal] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);

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

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await AuthService.sendPasswordRecoveryEmailVerification(
        name,
        userId,
        email
      );

      if (response.error) {
        console.error('인증번호 전송 실패:', response.error);
        let userErrorMessage = '인증번호 전송에 실패했습니다.';
        if (
          response.error.includes('아직 만료되지 않은 인증 코드가 존재합니다')
        ) {
          userErrorMessage =
            '아직 만료되지 않은 인증 코드가 존재합니다. 잠시 후 다시 시도해주세요.';
        } else if (
          response.error.includes(
            '입력하신 정보와 일치하는 회원을 찾을 수 없습니다'
          )
        ) {
          userErrorMessage =
            '입력하신 정보와 일치하는 회원을 찾을 수 없습니다.';
        } else if (response.error.includes('400')) {
          const match = response.error.match(/400: (.+)/);
          if (match) {
            userErrorMessage = match[1];
          }
        } else if (response.error.includes('404')) {
          const match = response.error.match(/404: (.+)/);
          if (match) {
            userErrorMessage = match[1];
          }
        } else if (
          response.error.includes('identifier') &&
          response.error.includes('must not be blank')
        ) {
          userErrorMessage = '아이디를 입력해 주세요.';
        }
        setErrorMessage(userErrorMessage);
        return;
      }

      setShowAuthCode(true);
      setTimeLeft(179);
      setIsVerified(false);
      setSuccessMessage('인증번호가 이메일로 전송되었습니다.');
    } catch (err) {
      console.error('인증번호 전송 실패', err);
      setErrorMessage('인증번호 전송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /** Verify 인증번호 */
  const handleVerifyCode = async () => {
    if (!authCode) return;

    setIsVerifying(true);

    try {
      console.log('API → 인증번호 검증 요청:', { email, code: authCode });

      const response = await AuthService.verifyEmailCode(email, authCode);

      if (response.error) {
        console.error('인증번호 검증 실패:', response.error);
        setIsVerified(false);
        return;
      }

      console.log('API → 인증 성공');
      setIsVerified(true);
    } catch (err) {
      console.error('인증번호 검증 실패', err);
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
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
      console.log('API → 최종 비밀번호 재설정 토큰 요청:', {
        name,
        userId,
        email,
      });

      const response = await AuthService.getPasswordRecoveryTokenByEmail(
        name,
        userId,
        email
      );

      if (response.error) {
        console.error('비밀번호 재설정 토큰 요청 실패:', response.error);
        let userErrorMessage = '비밀번호 재설정에 실패했습니다.';
        if (response.error.includes('400')) {
          const match = response.error.match(/400: (.+)/);
          if (match) {
            userErrorMessage = match[1];
          }
        }
        setErrorMessage(userErrorMessage);
        return;
      }

      console.log('비밀번호 재설정 토큰 요청 성공:', response.data);
      // Store the reset token for the next step
      if (response.data?.data?.resetToken) {
        setResetToken(response.data.data.resetToken);
        localStorage.setItem('resetToken', response.data.data.resetToken);
      }
      setShowModal(true);
    } catch (err) {
      console.error('비밀번호 재설정 실패', err);
      setErrorMessage('비밀번호 재설정 중 오류가 발생했습니다.');
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
            disabled={!email || !!errors.email || isLoading}
          >
            {isLoading ? '전송 중...' : '인증번호 전송'}
          </button>
        </div>
        {errors.email && <p className={styles.error}>{errors.email}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
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
                disabled={!authCode || isVerifying}
              >
                {isVerifying ? '검증 중...' : '인증 확인'}
              </button>
            </div>
          </div>

          {!isVerified && (
            <p className={styles.error}>이메일 인증을 완료해주세요.</p>
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
        <p className={styles.successMessage}>이메일 인증이 완료 되었습니다.</p>
        <button className={styles.modalButton} onClick={handleConfirm}>
          확인
        </button>
      </BaseModal>
    </div>
  );
}
