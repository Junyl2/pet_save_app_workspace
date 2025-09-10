'use client';
import { useState, useEffect } from 'react';
import styles from './SellerForm.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import FileUploadModal from './FileUploadModal';
import { FaChevronDown } from 'react-icons/fa';

export default function SellerInformation() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    businessNumber: '',
    representativeName: '',
    companyName: '',
    businessLicenseFile: null as File | null,
    address: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    bankbookFile: null as File | null,
    email: '',
    emailDomain: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [authError, setAuthError] = useState('');
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(179);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isBusinessDup, setIsBusinessDup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Input change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: '', businessNumberDup: '' }));
    if (name === 'authCode' && authError) setAuthError('');
    setIsBusinessDup(false);
  };

  // Dummy duplication check
  const handleCheckDuplication = () => {
    if (formData.businessNumber === '204-81-12345') {
      setErrors((prev) => ({
        ...prev,
        businessNumberDup: '이미 등록된 사업자등록번호입니다.',
      }));
      setIsBusinessDup(true);
    } else {
      setErrors((prev) => ({ ...prev, businessNumberDup: '' }));
      alert('사용 가능한 사업자등록번호입니다.');
      setIsBusinessDup(false);
    }
  };

  // Send verification code
  const handleSendCode = async () => {
    const generatedCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    alert('Check console log for the dummy code');
    console.log('API → Verification code:', generatedCode);
    setServerCode(generatedCode);
    setShowAuthCode(true);
    setTimeLeft(179);
    setIsVerified(false);
    setAuthCode('');
    setAuthError('');
  };

  // Verify code
  const handleVerifyCode = () => {
    if (authCode === serverCode) {
      setIsVerified(true);
      setAuthError('');
    } else {
      setIsVerified(false);
      setAuthError('올바른 인증번호를 입력해주세요.');
    }
  };

  // Countdown
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

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.businessNumber)
      newErrors.businessNumber = '사업자등록번호를 입력해주세요.';
    if (isBusinessDup)
      newErrors.businessNumberDup = '이미 등록된 사업자등록번호입니다.';
    if (!formData.representativeName)
      newErrors.representativeName = '대표자명을 입력해주세요.';
    if (!formData.companyName) newErrors.companyName = '상호명을 입력해주세요.';
    if (!formData.businessLicenseFile)
      newErrors.businessLicenseFile = '사업자등록증 사본을 첨부해주세요.';
    if (!formData.address) newErrors.address = '사업장 주소를 입력해주세요.';
    if (!formData.bankName) newErrors.bankName = '은행명을 입력해주세요.';
    if (!formData.accountNumber)
      newErrors.accountNumber = '계좌번호를 입력해주세요.';
    if (!formData.accountHolder)
      newErrors.accountHolder = '예금주명을 입력해주세요.';
    if (!formData.bankbookFile)
      newErrors.bankbookFile = '통장 사본을 첨부해주세요.';
    if (!formData.email || !formData.emailDomain)
      newErrors.email = '이메일을 입력해주세요.';
    if (!isVerified) newErrors.email = '이메일 인증을 완료해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log('Submitting seller form:', formData);
    setShowModal(true);
  };

  // Derived states
  const emailValid =
    formData.email.trim() !== '' && formData.emailDomain.trim() !== '';
  const canSendCode = emailValid && !isVerified;
  const canVerify = authCode.trim().length > 0;
  const canCheckDup = formData.businessNumber.trim().length > 0;
  const canSubmit =
    formData.businessNumber &&
    !isBusinessDup &&
    formData.representativeName &&
    formData.companyName &&
    formData.businessLicenseFile &&
    formData.address &&
    formData.bankName &&
    formData.accountNumber &&
    formData.accountHolder &&
    formData.bankbookFile &&
    formData.email &&
    formData.emailDomain &&
    isVerified;

  return (
    <>
      <form className={styles.container} onSubmit={handleSubmit}>
        {/* Business Number */}
        <div className={styles.formGroup}>
          <label className={styles.label}>사업자등록번호 (필수)</label>
          <div className={styles.emailInputWrapper}>
            <input
              type="text"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleChange}
              placeholder="사업자등록번호를 입력해주세요."
              className={`${styles.input} ${
                errors.businessNumber || errors.businessNumberDup
                  ? styles.errorInput
                  : ''
              }`}
            />
            <button
              type="button"
              className={`${styles.emailButton} ${
                canCheckDup ? styles.enabled : styles.disabled
              }`}
              disabled={!canCheckDup}
              onClick={handleCheckDuplication}
            >
              중복확인
            </button>
          </div>
          {errors.businessNumber && (
            <p className={styles.error}>{errors.businessNumber}</p>
          )}
          {errors.businessNumberDup && (
            <p className={styles.error}>{errors.businessNumberDup}</p>
          )}
        </div>

        {/* Representative */}
        <div className={styles.formGroup}>
          <label className={styles.label}>대표자명 (필수)</label>
          <input
            type="text"
            name="representativeName"
            value={formData.representativeName}
            onChange={handleChange}
            placeholder="대표자명을 입력해주세요."
            className={`${styles.input} ${
              errors.representativeName ? styles.errorInput : ''
            }`}
          />
          {errors.representativeName && (
            <p className={styles.error}>{errors.representativeName}</p>
          )}
        </div>

        {/* Company Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>상호명 (필수)</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="상호명을 입력해주세요."
            className={`${styles.input} ${
              errors.companyName ? styles.errorInput : ''
            }`}
          />
          {errors.companyName && (
            <p className={styles.error}>{errors.companyName}</p>
          )}
        </div>

        {/* Business License File */}
        <div className={styles.formGroup}>
          <label className={styles.label}>사업자등록증 사본 (필수)</label>
          <FileUploadModal
            file={formData.businessLicenseFile}
            setFile={(file) =>
              setFormData((prev) => ({ ...prev, businessLicenseFile: file }))
            }
          />
          {errors.businessLicenseFile && (
            <p className={styles.error}>{errors.businessLicenseFile}</p>
          )}
        </div>

        {/* Address */}
        <div className={styles.formGroup}>
          <label className={styles.label}>사업장 주소 (필수)</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="사업장 주소를 입력해주세요."
            className={`${styles.input} ${
              errors.address ? styles.errorInput : ''
            }`}
          />
          {errors.address && <p className={styles.error}>{errors.address}</p>}
        </div>

        {/* Bank Info */}
        <div className={styles.formGroup}>
          <label className={styles.label}>계좌 실명 인증 (필수)</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder="은행명을 입력해주세요."
            className={`${styles.input} ${
              errors.bankName ? styles.errorInput : ''
            }`}
          />
          {errors.bankName && <p className={styles.error}>{errors.bankName}</p>}

          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="계좌번호를 입력해주세요."
            className={`${styles.input} ${
              errors.accountNumber ? styles.errorInput : ''
            }`}
          />
          {errors.accountNumber && (
            <p className={styles.error}>{errors.accountNumber}</p>
          )}

          <input
            type="text"
            name="accountHolder"
            value={formData.accountHolder}
            onChange={handleChange}
            placeholder="예금주명을 입력해주세요."
            className={`${styles.input} ${
              errors.accountHolder ? styles.errorInput : ''
            }`}
          />
          {errors.accountHolder && (
            <p className={styles.error}>{errors.accountHolder}</p>
          )}

          {/* Bankbook File */}
          {/*  <label className={styles.label}>통장 사본 (필수)</label> */}
          <FileUploadModal
            file={formData.bankbookFile}
            setFile={(file) =>
              setFormData((prev) => ({ ...prev, bankbookFile: file }))
            }
          />
          {errors.bankbookFile && (
            <p className={styles.error}>{errors.bankbookFile}</p>
          )}
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label className={styles.label}>이메일 (필수)</label>
          <div className={styles.emailWrapper}>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일 아이디"
              className={`${styles.input} ${
                errors.email ? styles.errorInput : ''
              }`}
            />
            <span className={styles.atSymbol}>@</span>

            {/* Custom Dropdown */}
            <div className={styles.customSelectWrapper}>
              <div
                className={styles.customSelect}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {formData.emailDomain || '선택해주세요'}
                <FaChevronDown className={styles.chevronIcon} />
              </div>
              {dropdownOpen && (
                <ul className={styles.customSelectList}>
                  {['gmail.com', 'naver.com', 'daum.net'].map((domain) => (
                    <li
                      key={domain}
                      className={styles.customSelectItem}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          emailDomain: domain,
                        }));
                        setDropdownOpen(false);
                      }}
                    >
                      {domain}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {errors.email && !authError && (
            <p className={styles.error}>{errors.email}</p>
          )}
        </div>
        {/* Send Verification */}
        <div className={styles.authButton}>
          <button
            type="button"
            onClick={handleSendCode}
            className={`${styles.outlineButton} ${
              canSendCode ? styles.enabled : styles.disabled
            }`}
          >
            인증번호 전송
          </button>
        </div>

        {/* Auth Code */}
        {showAuthCode && (
          <div className={styles.formGroup}>
            <label>인증번호</label>
            <div className={styles.authContainer}>
              <input
                type="text"
                placeholder="인증번호를 입력해주세요."
                value={authCode}
                onChange={(e) => {
                  setAuthCode(e.target.value);
                  if (authError) setAuthError('');
                }}
                className={`${styles.authInput} ${
                  authError ? styles.errorInput : ''
                }`}
              />
              <div className={styles.authFooter}>
                <span className={styles.timer}>{formatTime(timeLeft)}</span>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className={`${styles.inlineButton} ${
                    canVerify ? styles.enabled : styles.disabled
                  }`}
                >
                  인증 확인
                </button>
              </div>
            </div>
            {authError && <p className={styles.error}>{authError}</p>}
            {isVerified && (
              <p className={styles.success}>인증이 완료되었습니다.</p>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className={`${styles.bottomButton} ${
            canSubmit ? styles.enabled : styles.disabled
          }`}
          disabled={!canSubmit}
        >
          사업자 등록하기
        </button>
      </form>

      {/* Modal */}
      <BaseModal open={showModal} onClose={() => setShowModal(false)}>
        <div className={styles.imageWrapper}>
          <Image
            src="/images/icons/member-check.png"
            alt="Success"
            height={60}
            width={60}
          />
        </div>
        <h1 className={styles.modalTitle}>사업자 등록 완료</h1>
        <p className={styles.successMessage}>정상적으로 등록되었습니다.</p>
        <button
          className={styles.modalButton}
          onClick={() => {
            setShowModal(false);
            router.push('/client/pages/homepage');
          }}
        >
          확인
        </button>
      </BaseModal>
    </>
  );
}
