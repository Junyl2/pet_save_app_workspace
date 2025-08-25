'use client';
import { useState, useEffect } from 'react';
import styles from './MembershipInformation.module.css';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';

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
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Email verification states
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(179);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // clear error on typing
  };

  // Send verification code
  const handleSendCode = async () => {
    try {
      const generatedCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      alert('Check console log for the dummy code');
      console.log(
        'API → Verification code:',
        generatedCode,
        'to:',
        `${formData.email}@${formData.emailDomain}`
      );
      setServerCode(generatedCode);
      setShowAuthCode(true);
      setTimeLeft(179);
      setIsVerified(false);
    } catch (err) {
      console.error('Failed to send verification code', err);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (authCode === serverCode) {
      console.log('API → Verification success');
      setIsVerified(true);
      setErrors((prev) => ({ ...prev, email: '' }));
    } else {
      console.log('API → Verification failed');
      setIsVerified(false);
      setErrors((prev) => ({
        ...prev,
        email: '올바른 인증번호를 입력해주세요.',
      }));
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
    } else if (!/^[0-9]{10}$/.test(formData.password)) {
      newErrors.password = '비밀번호는 숫자 10자리여야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.phone) newErrors.phone = '휴대폰 번호를 입력해주세요.';
    if (!formData.email || !formData.emailDomain)
      newErrors.email = '이메일을 입력해주세요.';
    if (!isVerified) newErrors.email = '이메일 인증을 완료해주세요.';
    if (!formData.postalCode || !formData.address)
      newErrors.address = '배송지 주소를 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    try {
      console.log('Submitting form:', formData);
      setShowModal(true);
    } catch (error) {
      console.error('Sign-up failed:', error);
      alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const canSendCode = formData.email && formData.emailDomain;
  const canVerify = !!authCode;

  // 가입하기 버튼 활성화 조건
  const canSubmit =
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
      <form className={styles.container} onSubmit={handleSubmit}>
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
              placeholder="띄어쓰기 없이 숫자 10자"
              className={styles.input}
              autoComplete="new-password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
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
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
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
            disabled={!canSendCode}
            style={{
              backgroundColor: canSendCode ? '#66bfa7' : undefined,
              color: canSendCode ? '#fff' : undefined,
            }}
            className={styles.outlineButton}
          >
            인증번호 전송
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
                  disabled={!canVerify}
                  style={{
                    backgroundColor: canVerify ? '#66bfa7' : undefined,
                    borderColor: canVerify ? '#66bfa7' : undefined,
                    outline: canVerify ? 'none' : undefined,
                  }}
                  className={styles.inlineButton}
                >
                  인증 확인
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
          가입 하기
        </button>
      </form>

      {/* Success Modal */}
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

        <p className={styles.successMessage}>정상적으로 회원가입 되었습니다.</p>
        <button
          className={styles.modalButton}
          onClick={() => {
            setShowModal(false);
            router.push('/client/login');
          }}
        >
          로그인 페이지로 이동
        </button>
      </BaseModal>
    </>
  );
}
