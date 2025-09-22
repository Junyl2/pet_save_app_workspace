'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';

import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import AuthenticationComplete from '@/app/components/pages/auth/find-id/AuthenticationComplete';
import { AuthService } from '@/app/api/services/client/auth/authService';
import styles from './FindIdForm.module.css';

/** Narrow type for the findIdByEmail payload to avoid `any` */
interface FindIdByEmailPayload {
  success?: boolean;
  message?: string;
  resultMsg?: string;
  data?: unknown;
}

export default function FindIdFormEmail() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(179);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /** Validation */
  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name) newErrors.name = '이름을 입력해 주세요.';
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
      const response = await AuthService.sendFindIdEmailVerification(
        name,
        email
      );

      if (response.error) {
        console.error('인증번호 전송 실패:', response.error);

        // Extract the actual error message from the API response
        let userErrorMessage = '인증번호 전송에 실패했습니다.';

        if (
          response.error.includes('아직 만료되지 않은 인증 코드가 존재합니다')
        ) {
          userErrorMessage =
            '아직 만료되지 않은 인증 코드가 존재합니다. 잠시 후 다시 시도해주세요.';
        } else if (response.error.includes('400')) {
          // Extract the Korean message from the error
          const match = response.error.match(/400: (.+)/);
          if (match) {
            userErrorMessage = match[1];
          }
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
    !!name && !!email && Object.keys(errors).length === 0 && isVerified;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('🚀 API → 최종 아이디 확인 요청:', {
        name,
        email,
        timestamp: new Date().toISOString(),
        note: 'This should trigger email sending with user ID',
      });

      // Call the find ID API
      const response = await AuthService.findIdByEmail(name, email);

      if (response.error) {
        console.error('❌ 아이디 찾기 실패:', {
          error: response.error,
          name,
          email,
          timestamp: new Date().toISOString(),
        });

        // Extract error message for user
        let userErrorMessage = '아이디 찾기에 실패했습니다.';
        if (response.error.includes('400')) {
          const match = response.error.match(/400: (.+)/);
          if (match) {
            userErrorMessage = match[1];
          }
        }
        setErrorMessage(userErrorMessage);
        return;
      }

      console.log('✅ 아이디 찾기 성공:', {
        responseData: response.data,
        name,
        email,
        timestamp: new Date().toISOString(),
        note: 'Email should now be sent to user with their ID information',
      });

      // Check if the response indicates email was sent
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as FindIdByEmailPayload;
        console.log('📧 Email sending status:', {
          success: responseData.success,
          message: responseData.message ?? responseData.resultMsg,
          data: responseData.data,
        });
      }

      setShowModal(true);
    } catch (err) {
      console.error('💥 아이디 확인 실패', {
        error: err,
        name,
        email,
        timestamp: new Date().toISOString(),
      });
      setErrorMessage('아이디 찾기 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /** Confirm → show AuthenticationComplete */
  const handleConfirm = () => {
    setShowModal(false);
    setShowComplete(true);
    setConfirmedName(name);
    setConfirmedEmail(email);
  };

  //  if authentication is complete, render that component instead
  if (showComplete) {
    return (
      <AuthenticationComplete name={confirmedName} email={confirmedEmail} />
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
        <h1 className={styles.title}>아이디 찾기</h1>
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
          className={errors.name ? styles.inputError : ''}
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}
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
            onBlur={validate}
            className={errors.email ? styles.inputError : ''}
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
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}
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
              className={!authCode ? styles.inputError : ''}
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
            <p className={styles.error}>이메일 인증를 완료해주세요.</p>
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
        아이디 확인
      </button>

      {/* Success Modal */}
      <BaseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="아이디 확인 완료"
      >
        <p className={styles.successMessage}>
          아이디 확인 요청이 완료되었습니다.
        </p>
        <button className={styles.modalButton} onClick={handleConfirm}>
          확인
        </button>
      </BaseModal>
    </div>
  );
}
