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

  // 인증 관련 state
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
  };

  // 인증번호 전송
  const handleSendCode = async () => {
    try {
      const generatedCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      alert('Check console log for the dummy code');
      console.log(
        'API → 인증번호 전송:',
        generatedCode,
        'to:',
        `${formData.email}@${formData.emailDomain}`
      );
      setServerCode(generatedCode);
      setShowAuthCode(true);
      setTimeLeft(179);
      setIsVerified(false);
    } catch (err) {
      console.error('인증번호 전송 실패', err);
    }
  };

  // 인증 확인
  const handleVerifyCode = async () => {
    if (authCode === serverCode) {
      console.log('API → 인증 성공');
      setIsVerified(true);
    } else {
      console.log('API → 인증 실패');
      setIsVerified(false);
    }
  };

  // 카운트다운
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

  const handleSubmit = async () => {
    setShowModal(true);
    /*   try {
      console.log('Submitting form:', formData);
      alert('Sign-up complete!');
    } catch (error) {
      console.error('Sign-up failed:', error);
      alert('An error occurred during sign-up. Please try again.');
    } */
  };

  const canSendCode = formData.email && formData.emailDomain;
  const canVerify = !!authCode;

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

      <div className={styles.container}>
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
          />
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
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </span>
          </div>
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
        </div>

        {/* send Verification code */}
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
          type="button"
          className={`${styles.bottomButton} ${
            formData.name &&
            formData.username &&
            formData.password &&
            formData.confirmPassword &&
            formData.phone &&
            formData.email &&
            formData.emailDomain &&
            formData.postalCode &&
            formData.address
              ? styles.enabled
              : ''
          }`}
          disabled={
            !(
              formData.name &&
              formData.username &&
              formData.password &&
              formData.confirmPassword &&
              formData.phone &&
              formData.email &&
              formData.emailDomain &&
              formData.postalCode &&
              formData.address
            )
          }
          onClick={handleSubmit}
        >
          가입 하기
        </button>
      </div>

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

        <h1 className={styles.modalTitle}>회원가입 완료</h1>

        <p className={styles.successMessage}>
          회원가입이 성공적으로 완료되었습니다.
        </p>
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
