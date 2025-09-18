'use client';
import { useState, useEffect } from 'react';
import styles from './MembershipInformation.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';
import { PAGE_URLS } from '@/app/utils/page_url';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import { AuthService } from '@/app/api/services/client/auth/authService';
import {
  MemberSignupDto,
  LOGIN_TYPES,
} from '@/app/api/types/auth/MemberSignupDto';
import { EmailVerificationRequest } from '@/app/api/types/auth/EmailVerification';

export default function MembershipInformation() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    emailDomain: '',
    postalCode: '',
    address: '',
    detailAddress: '',
    referral: '',
    birthDate: '', // Add birth date field
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Email verification states
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(179);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug modal state
  useEffect(() => {
    console.log('showModal state changed:', showModal);
  }, [showModal]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', general: '' })); // clear error on typing
  };

  // Send verification code
  const handleSendCode = async () => {
    if (isSendingCode) return; // Prevent multiple requests

    setIsSendingCode(true);

    try {
      const emailAddress = `${formData.email}@${formData.emailDomain}`;

      const verificationData: EmailVerificationRequest = {
        name: formData.name || 'User', // Use name if available, otherwise default
        email: emailAddress,
      };

      console.log('Sending email verification:', verificationData);

      const response = await AuthService.sendEmailVerification(
        verificationData
      );

      if (response.error) {
        console.error('Failed to send verification code:', response.error);
        setErrors((prev) => ({
          ...prev,
          email: `인증번호 전송에 실패했습니다: ${response.error}`,
        }));
        setIsSendingCode(false);
        return;
      }

      console.log('Email verification sent successfully:', response.data);

      // If the API returns a verification code, use it; otherwise generate a dummy one for testing
      const verificationCode =
        response.data?.verificationCode ||
        Math.floor(100000 + Math.random() * 900000).toString();

      setServerCode(verificationCode);
      setShowAuthCode(true);
      setTimeLeft(179);
      setIsVerified(false);
      setErrors((prev) => ({ ...prev, email: '' })); // Clear any previous errors

      // Show success message (removed alert)
      console.log('인증번호가 이메일로 전송되었습니다.');
      setIsSendingCode(false);
    } catch (err) {
      console.error('Failed to send verification code', err);
      setErrors((prev) => ({
        ...prev,
        email: '인증번호 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
      }));
      setIsSendingCode(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (isVerifyingCode) return; // Prevent multiple requests

    if (!authCode.trim()) {
      setErrors((prev) => ({
        ...prev,
        email: '인증번호를 입력해주세요.',
      }));
      return;
    }

    setIsVerifyingCode(true);

    try {
      const emailAddress = `${formData.email}@${formData.emailDomain}`;

      console.log('Verifying email code:', {
        email: emailAddress,
        code: authCode,
      });

      const response = await AuthService.verifyEmailCode(
        emailAddress,
        authCode
      );

      if (response.error) {
        console.error('Code verification failed:', response.error);
        setIsVerified(false);
        setErrors((prev) => ({
          ...prev,
          email: '인증번호가 올바르지 않습니다. 다시 확인해주세요.',
        }));
        setIsVerifyingCode(false);
        return;
      }

      console.log('Code verification successful:', response.data);
      setIsVerified(true);
      setErrors((prev) => ({ ...prev, email: '' }));

      // Show success message (removed alert)
      console.log('이메일 인증이 완료되었습니다.');
      setIsVerifyingCode(false);
    } catch (error) {
      console.error('Code verification error:', error);
      setIsVerified(false);
      setErrors((prev) => ({
        ...prev,
        email: '인증 중 오류가 발생했습니다. 다시 시도해주세요.',
      }));
      setIsVerifyingCode(false);
    }
  };

  // Countdown timer
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

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = '이름을 입력해주세요.';

    if (!formData.username) {
      newErrors.username = '아이디를 입력해주세요.';
    } else if (!/^[a-z0-9]+$/.test(formData.username)) {
      newErrors.username = '아이디는 영문 소문자와 숫자만 사용할 수 있습니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      newErrors.password =
        '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.phone) {
      newErrors.phone = '휴대폰 번호를 입력해주세요.';
    } else if (!/^[0-9+\-]+$/.test(formData.phone)) {
      newErrors.phone = '휴대폰 번호는 숫자, +, -만 사용할 수 있습니다.';
    }
    if (!formData.email || !formData.emailDomain)
      newErrors.email = '이메일을 입력해주세요.';
    if (!isVerified) newErrors.email = '이메일 인증을 완료해주세요.';
    if (!formData.postalCode || !formData.address)
      newErrors.address = '배송지 주소를 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submit triggered');
    e.preventDefault(); // Always prevent default form submission
    e.stopPropagation(); // Stop event bubbling

    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Already submitting, please wait...');
      return;
    }

    // Clear any previous general errors
    setErrors((prev) => ({ ...prev, general: '' }));

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      setIsSubmitting(false);
      return;
    }

    console.log('Starting form submission...');
    setIsSubmitting(true);

    try {
      // Prepare data for API call
      const signupData: MemberSignupDto = {
        identifier: formData.username.trim(),
        password: formData.password,
        loginType: LOGIN_TYPES.GENERAL,
        email: `${formData.email.trim()}@${formData.emailDomain}`,
        phoneNumber: formData.phone.trim(),
        zipCode: formData.postalCode.trim(),
        roadAddress: formData.address.trim(),
        detailedAddress: formData.detailAddress.trim(),
        // Optional fields - only include if they have values
        ...(formData.name?.trim() && { name: formData.name.trim() }),
        ...(formData.name?.trim() && { nickname: formData.name.trim() }), // Using name as nickname if no separate nickname field
        ...(formData.birthDate && {
          birthDate: formData.birthDate, // Send as-is first, might need different format
        }),
        ...(formData.referral?.trim() && {
          referralCode: formData.referral.trim(),
        }),
      };

      console.log('Form data before mapping:', formData);
      console.log('Mapped signup data:', signupData);

      // Validate required fields before sending
      const requiredFields = [
        'identifier',
        'password',
        'loginType',
        'email',
        'phoneNumber',
        'zipCode',
        'roadAddress',
        'detailedAddress',
      ];
      const missingFields = requiredFields.filter(
        (field) => !signupData[field as keyof MemberSignupDto]
      );

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        setErrors((prev) => ({
          ...prev,
          general: `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
        }));
        setIsSubmitting(false);
        return;
      }

      // Check for empty strings
      const emptyFields = requiredFields.filter((field) => {
        const value = signupData[field as keyof MemberSignupDto];
        return typeof value === 'string' && value.trim() === '';
      });

      if (emptyFields.length > 0) {
        console.error('Empty required fields:', emptyFields);
        setErrors((prev) => ({
          ...prev,
          general: `필수 필드가 비어있습니다: ${emptyFields.join(', ')}`,
        }));
        setIsSubmitting(false);
        return;
      }

      // Validate phone number format
      if (
        signupData.phoneNumber &&
        !/^[0-9+\-]+$/.test(signupData.phoneNumber)
      ) {
        console.error('Invalid phone number format:', signupData.phoneNumber);
        setErrors((prev) => ({
          ...prev,
          general: '휴대폰 번호 형식이 올바르지 않습니다.',
        }));
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (signupData.email && !emailRegex.test(signupData.email)) {
        console.error('Invalid email format:', signupData.email);
        setErrors((prev) => ({
          ...prev,
          general: '이메일 형식이 올바르지 않습니다.',
        }));
        setIsSubmitting(false);
        return;
      }

      // Validate password format
      if (
        signupData.password &&
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(
          signupData.password
        )
      ) {
        console.error('Invalid password format:', signupData.password);
        setErrors((prev) => ({
          ...prev,
          general:
            '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
        }));
        setIsSubmitting(false);
        return;
      }

      // Log the final data being sent
      console.log(
        'Final signup data being sent to API:',
        JSON.stringify(signupData, null, 2)
      );

      const response = await AuthService.signupGeneral(signupData);

      if (response.error) {
        console.error('Signup failed:', response.error);

        // Extract specific error message from API response
        let errorMessage = response.error;

        // Check if it's a specific API error message
        if (typeof response.error === 'string') {
          // If the error contains Korean text, use it directly
          if (
            response.error.includes('이미 사용 중인 이메일') ||
            response.error.includes('이미 사용 중인') ||
            response.error.includes('사용 중인')
          ) {
            errorMessage =
              response.error +
              ' 다른 이메일 주소를 사용하거나 로그인을 시도해보세요.';
          } else if (response.error.includes('409')) {
            errorMessage =
              '이미 사용 중인 이메일 주소입니다. 다른 이메일을 사용해주세요.';
          } else if (response.error.includes('400')) {
            errorMessage = '입력 정보를 다시 확인해주세요.';
          } else {
            errorMessage = `회원가입 중 오류가 발생했습니다: ${response.error}`;
          }
        }

        // Show error in UI
        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
        setIsSubmitting(false);
        return;
      }

      console.log('Signup successful:', response.data);
      console.log('Setting showModal to true...');
      setShowModal(true);
      setIsSubmitting(false);
      console.log('Modal should now be visible');
    } catch (error) {
      console.error('Sign-up failed:', error);

      // Extract specific error message from caught error
      let errorMessage = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';

      if (error instanceof Error) {
        const errorString = error.message;

        // Check for specific error patterns
        if (
          errorString.includes('이미 사용 중인 이메일') ||
          errorString.includes('이미 사용 중인') ||
          errorString.includes('사용 중인')
        ) {
          errorMessage =
            errorString +
            ' 다른 이메일 주소를 사용하거나 로그인을 시도해보세요.';
        } else if (errorString.includes('409')) {
          errorMessage =
            '이미 사용 중인 이메일 주소입니다. 다른 이메일을 사용해주세요.';
        } else if (errorString.includes('400')) {
          errorMessage = '입력 정보를 다시 확인해주세요.';
        } else if (errorString.includes('Request failed with status code')) {
          // Extract status code and provide appropriate message
          const statusMatch = errorString.match(/status code (\d+)/);
          if (statusMatch) {
            const statusCode = statusMatch[1];
            if (statusCode === '409') {
              errorMessage =
                '이미 사용 중인 이메일 주소입니다. 다른 이메일을 사용하거나 로그인을 시도해보세요.';
            } else if (statusCode === '400') {
              errorMessage = '입력 정보를 다시 확인해주세요.';
            }
          }
        }
      }

      // Show error in UI
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
      setIsSubmitting(false);
    }
  };

  const canSendCode = formData.email && formData.emailDomain;
  const canVerify = !!authCode;

  // 가입하기 버튼 활성화 조건
  const canSubmit =
    !isSubmitting &&
    formData.name &&
    formData.username &&
    formData.password &&
    formData.confirmPassword &&
    formData.phone &&
    formData.email &&
    formData.emailDomain &&
    formData.postalCode &&
    formData.address &&
    isVerified;

  return (
    <>
      {/* Page header */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
        >
          <FaChevronLeft className={styles.backIcon} />
        </button>
        <h1 className={styles.headerTitle}>회원가입</h1>
      </div>

      {/* Wrap inputs in a form */}
      <form className={styles.container} onSubmit={handleSubmit} noValidate>
        {/* General Error Display */}
        {errors.general && (
          <div className={styles.errorContainer}>
            <p className={styles.error}>{errors.general}</p>
            {errors.general.includes('이미 사용 중인') && (
              <p className={styles.errorLink}>
                이미 계정이 있으신가요?{' '}
                <Link href={PAGE_URLS.LOGIN} className={styles.link}>
                  로그인하기
                </Link>
              </p>
            )}
          </div>
        )}
        {/* Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>이름 (필수)</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름을 입력해주세요."
            className={styles.input}
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>

        {/* Username */}
        <div className={styles.formGroup}>
          <label className={styles.label}>아이디 (필수)</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="아이디를 영문 소문자, 숫자 입력해주세요."
            className={styles.input}
            autoComplete="username"
          />
          {errors.username && <p className={styles.error}>{errors.username}</p>}
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label className={styles.label}>비밀번호 (필수)</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="대문자, 소문자, 숫자, 특수문자 포함 8자 이상"
              className={styles.input}
              autoComplete="new-password"
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </span>
          </div>
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className={styles.formGroup}>
          <label className={styles.label}>비밀번호 확인 (필수)</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 한번 더 입력해주세요."
              className={styles.input}
              autoComplete="new-password"
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className={styles.error}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className={styles.formGroup}>
          <label className={styles.label}>휴대폰 번호 (필수)</label>
          <div className={styles.inlineGroup}>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="휴대폰번호를 입력해 주세요."
              className={styles.input}
            />
          </div>
          {errors.phone && <p className={styles.error}>{errors.phone}</p>}
        </div>

        {/* Birth Date */}
        <div className={styles.formGroup}>
          <label className={styles.label}>생년월일 (선택)</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label className={styles.label}>이메일 (필수)</label>
          <div className={styles.inlineGroup}>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일 아이디"
              className={styles.input}
            />
            <select
              name="emailDomain"
              value={formData.emailDomain}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">선택해주세요</option>
              <option value="gmail.com">gmail.com</option>
              <option value="naver.com">naver.com</option>
              <option value="daum.net">daum.net</option>
            </select>
          </div>
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        {/* Send Verification Code */}
        <div className={styles.authButton}>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={!canSendCode || isSendingCode}
            style={{
              backgroundColor:
                canSendCode && !isSendingCode ? '#66bfa7' : undefined,
              color: canSendCode && !isSendingCode ? '#fff' : undefined,
            }}
            className={styles.outlineButton}
          >
            {isSendingCode ? '전송 중...' : '인증번호 전송'}
          </button>
        </div>

        {/* Authentication Code Section */}
        {showAuthCode && (
          <div className={styles.formGroup}>
            <label>인증번호</label>
            <div className={styles.authContainer}>
              <input
                type="text"
                placeholder="인증번호를 입력해 주세요."
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className={styles.authInput}
              />

              <div className={styles.authFooter}>
                <span className={styles.timer}>{formatTime(timeLeft)}</span>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={!canVerify || isVerifyingCode}
                  style={{
                    backgroundColor:
                      canVerify && !isVerifyingCode ? '#66bfa7' : undefined,
                    borderColor:
                      canVerify && !isVerifyingCode ? '#66bfa7' : undefined,
                    outline: canVerify && !isVerifyingCode ? 'none' : undefined,
                  }}
                  className={styles.inlineButton}
                >
                  {isVerifyingCode ? '확인 중...' : '인증 확인'}
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

        {/* Address */}
        <div className={styles.formGroup}>
          <label className={styles.label}>배송지 (필수)</label>
          <div className={styles.emailInputWrapper}>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="우편번호"
              className={styles.input}
            />
            <button type="button" className={styles.emailButton}>
              주소 검색
            </button>
          </div>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="도로명 주소"
            className={styles.input}
          />
          <input
            type="text"
            name="detailAddress"
            value={formData.detailAddress}
            onChange={handleChange}
            placeholder="상세주소"
            className={styles.input}
          />
          {errors.address && <p className={styles.error}>{errors.address}</p>}
        </div>

        {/* Referral Code */}
        <div className={styles.formGroup}>
          <label className={styles.label}>추천인 코드</label>
          <input
            type="text"
            name="referral"
            value={formData.referral}
            onChange={handleChange}
            placeholder="추천인 아이디를 입력해 주세요."
            className={styles.input}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`${styles.bottomButton} ${
            canSubmit ? styles.enabled : ''
          }`}
          disabled={!canSubmit}
        >
          {isSubmitting ? '가입 중...' : '가입 하기'}
        </button>
      </form>

      {/* Success Modal */}
      {isClient && showModal && (
        <BaseModal open={showModal} onClose={() => setShowModal(false)}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/icons/member-check.png"
              alt="Success Icon"
              height={60}
              width={60}
              className={styles.checkIcon}
            />
          </div>

          <h1 className={styles.modalTitle}>회원가입 완료</h1>

          <p className={styles.successMessage}>
            정상적으로 회원가입 되었습니다.
          </p>
          <button
            className={styles.modalButton}
            onClick={() => {
              console.log('Modal close button clicked');
              setShowModal(false);
              // Add a small delay before redirect to ensure modal closes
              setTimeout(() => {
                router.push('/client/login');
              }, 100);
            }}
          >
            로그인 페이지로 이동
          </button>
        </BaseModal>
      )}
    </>
  );
}
