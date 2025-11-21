'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { SecureService } from '@/app/api/services/client/auth/secureService';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import { useAuth } from '@/app/context/authContext';
import { PAGE_URLS } from '@/app/utils/page_url';
import styles from './PasswordChange.module.css';

export default function PasswordChange() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showToast, setShowToast] = useState(false);

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

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다.';
      } else if (formData.newPassword.length > 16) {
        newErrors.newPassword = '비밀번호는 최대 16자까지 가능합니다.';
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(
          formData.newPassword
        )
      ) {
        newErrors.newPassword =
          '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.';
      }
    }

    // Check if new password is different from current password
    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords first
    if (!validatePasswords()) {
      return;
    }

    try {
      setIsSubmitting(true);
      // Clear only general errors, keep validation errors
      setErrors((prev) => {
        const { general, ...validationErrors } = prev;
        return validationErrors;
      });

      console.log('🔄 Changing password...');

      const response = await SecureService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.error) {
        console.error('❌ Password change failed:', response.error);

        // Handle specific error cases
        const errorMessage = response.error.toLowerCase();
        if (
          errorMessage.includes('401') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('incorrect') ||
          errorMessage.includes('wrong') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('현재 비밀번호')
        ) {
          setErrors({
            currentPassword: '현재 비밀번호가 올바르지 않습니다.'
          });
        } else if (errorMessage.includes('400') || errorMessage.includes('validation')) {
          setErrors({
            newPassword: '새 비밀번호가 요구사항을 만족하지 않습니다.',
          });
        } else {
          setErrors({
            general: '비밀번호 변경에 실패했습니다. 다시 시도해주세요.',
          });
        }
        return;
      }

      if (response.data?.success) {
        console.log('✅ Password changed successfully');
        setShowToast(true);

        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // Logout user and redirect to login after showing toast
        setTimeout(async () => {
          try {
            await logout();
            router.push(PAGE_URLS.LOGIN);
          } catch (error) {
            console.error('Error during logout after password change:', error);
            // Still redirect to login even if logout fails
            router.push(PAGE_URLS.LOGIN);
          }
        }, 2000);
      } else {
        setErrors({ general: '비밀번호 변경에 실패했습니다.' });
      }
    } catch (error) {
      console.error('💥 Password change error:', error);
      setErrors({ general: '비밀번호 변경 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
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

          {/* General Error Message */}
          {errors.general && (
            <div
              style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              ❌ {errors.general}
            </div>
          )}

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>현재 비밀번호</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.currentPassword ? styles.inputError : ''
                }`}
                placeholder=""
              />
              {errors.currentPassword && (
                <p className={styles.errorMessage}>{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>새 비밀번호 (8-16자 이내)</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.newPassword ? styles.inputError : ''
                }`}
                placeholder=""
              />
              {errors.newPassword && (
                <p className={styles.errorMessage}>{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>새 비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.confirmPassword ? styles.inputError : ''
                }`}
                placeholder=""
              />
              {errors.confirmPassword && (
                <p className={styles.errorMessage}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`${styles.submitBtn} ${
                !canSubmit || isSubmitting ? styles.disabled : ''
              }`}
              disabled={!canSubmit || isSubmitting}
              style={{
                opacity: !canSubmit || isSubmitting ? 0.6 : 1,
                cursor: !canSubmit || isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? '비밀번호 변경 중...' : '비밀번호 변경완료'}
            </button>
          </form>
        </div>
      </div>

      {/* Toast Message */}
      {showToast && (
        <ToastMessage
          message="비밀번호가 성공적으로 변경되었습니다! 보안을 위해 로그아웃됩니다."
          onClose={() => setShowToast(false)}
          duration={2000}
        />
      )}
    </>
  );
}
