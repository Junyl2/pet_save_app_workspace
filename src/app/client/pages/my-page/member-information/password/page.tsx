'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './PasswordChange.module.css';

export default function PasswordChange() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswords = () => {
    const newErrors: { [key: string]: string } = {};

    // Check if current password is correct (simulate API call)
    if (formData.currentPassword !== '••••••••') {
      newErrors.currentPassword = '현재 비밀번호가 올바르지 않습니다.';
    }

    // Check new password length
    if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
      newErrors.newPassword = '비밀번호는 8-16자 이내로 입력해주세요.';
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePasswords()) {
      setIsVerified(true);
      // Simulate API call delay
      setTimeout(() => {
        console.log('Password change successful:', formData);
        router.back();
      }, 2000);
    }
  };

  const canSubmit =
    formData.currentPassword &&
    formData.newPassword &&
    formData.confirmPassword;

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        {/* Content */}
        <div className={styles.content}>
          {/* Description */}
          <div className={styles.description}>
            <p>주기적인 비밀번호 변경은 개인정보를 안전하게</p>
            <p>보호하고 개인정보 도용 피해를 예방할 수 있어요</p>
            <p>비밀번호를 변경하면 로그아웃돼요</p>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>현재 비밀번호</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.currentPassword ? styles.inputError : ''
                  }`}
                  placeholder=""
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className={styles.errorMessage}>{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>새 비밀번호 (8-16자 이내)</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.newPassword ? styles.inputError : ''
                  }`}
                  placeholder=""
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPassword && (
                <p className={styles.errorMessage}>{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>새 비밀번호 확인</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.confirmPassword ? styles.inputError : ''
                  }`}
                  placeholder=""
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={styles.errorMessage}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`${styles.submitBtn} ${
                !canSubmit ? styles.disabled : ''
              } ${isVerified ? styles.verified : ''}`}
              disabled={!canSubmit || isVerified}
            >
              {isVerified ? '비밀번호 변경완료 ✓' : '비밀번호 변경완료'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
