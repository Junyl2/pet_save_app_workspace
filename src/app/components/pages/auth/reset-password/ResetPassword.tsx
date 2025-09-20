'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import { AuthService } from '@/app/api/services/client/auth/authService';
import Image from 'next/image';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ password: '', confirm: '' });
  const [isValid, setIsValid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validate inputs whenever they change
  useEffect(() => {
    let passError = '';
    let confirmError = '';

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (trimmedPassword && !/^\d{10}$/.test(trimmedPassword)) {
      passError = '입력하신 비밀번호가 지정된 형식에 맞지 않습니다.';
    }

    if (trimmedConfirm && trimmedPassword !== trimmedConfirm) {
      confirmError = '비밀번호 확인 값이 일치하지 않습니다.';
    }

    setErrors({ password: passError, confirm: confirmError });

    setIsValid(
      !!(trimmedPassword && trimmedConfirm && !passError && !confirmError)
    );
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Get reset token from URL params or localStorage
      // For now, we'll use a placeholder - in real implementation,
      // this should come from the previous step
      const resetToken =
        localStorage.getItem('resetToken') || 'placeholder_token';

      console.log('API → 비밀번호 재설정 요청:', { newPassword: password });

      const response = await AuthService.resetPassword(password, resetToken);

      if (response.error) {
        console.error('비밀번호 재설정 실패:', response.error);
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

      console.log('비밀번호 재설정 성공:', response.data);
      setShowModal(true);
    } catch (err) {
      console.error('비밀번호 재설정 실패', err);
      setErrorMessage('비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <FaChevronLeft className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>비밀번호 찾기</h1>
      </div>

      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className={styles.inputGroup}>
            <label>새로운 비밀번호</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                name="new-password"
                placeholder="띄어쓰기 없이 숫자 10자"
                onChange={(e) => setPassword(e.target.value)}
                className={password && errors.password ? styles.inputError : ''}
                autoComplete="new-password"
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>
            {errors.password && (
              <p className={styles.error}>{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label>비밀번호 확인</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                name="new-password"
                placeholder="비밀번호를 한번 더 입력해주세요."
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={
                  confirmPassword && errors.confirm ? styles.inputError : ''
                }
                autoComplete="new-password"
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>
            {errors.confirm && <p className={styles.error}>{errors.confirm}</p>}
          </div>

          {/* Error Message */}
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.modalButton}
            disabled={!isValid || isLoading}
          >
            {isLoading ? '변경 중...' : '변경하기'}
          </button>
        </form>

        {/* Success Modal */}
        <BaseModal open={showModal} onClose={() => setShowModal(false)}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/icons/check-circle.png"
              alt="Success Icon"
              height={60}
              width={60}
              className={styles.checkIcon}
            />
          </div>

          <h1 className={styles.modalTitle}>비밀번호 변경 완료</h1>

          <p className={styles.successMessage}>
            비밀번호가 성공적으로 변경되었습니다.
          </p>
          <button
            className={styles.modalButton}
            onClick={() => {
              setShowModal(false);
              // Clear the reset token from localStorage
              localStorage.removeItem('resetToken');
              router.push('/client/login');
            }}
          >
            로그인 페이지로 이동
          </button>
        </BaseModal>
      </div>
    </>
  );
}
