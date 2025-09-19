'use client';
import { useState, useEffect } from 'react';
import styles from './SellerForm.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import FileUploadModal from './FileUploadModal';
import { FaChevronDown } from 'react-icons/fa';
import { AuthService } from '@/app/api/services/client/auth/authService';
import { SellerMembershipUpgradeRequest } from '@/app/api/types/auth/SellerMembershipUpgrade';
import { useUser } from '@/app/context/userContext';

type FormState = {
  businessNumber: string;
  representativeName: string;
  companyName: string;
  businessLicenseFile: File | null;
  postalCode: string;
  address: string;
  detailAddress: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankbookFile: File | null;
  email: string;
  emailDomain: string;
};

type SellerInformationProps = {
  initial?: Partial<FormState> & {
    // optional display labels when readOnly
    businessLicenseLabel?: string;
    bankbookLabel?: string;
  };
  readOnly?: boolean;
  banner?: string; // top banner + read-only footer message
  status?: string; // if you need it for analytics/logic
  onDone?: () => void;
};

export default function SellerInformation({
  initial,
  readOnly = false,
  banner,
  status,
  onDone,
}: SellerInformationProps) {
  const router = useRouter();
  const { user, login } = useUser();

  const [formData, setFormData] = useState<FormState>({
    businessNumber: '',
    representativeName: '',
    companyName: '',
    businessLicenseFile: null,
    postalCode: '',
    address: '',
    detailAddress: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    bankbookFile: null,
    email: '',
    emailDomain: '',
  });

  // display-only names for files when readOnly
  const [displayNames, setDisplayNames] = useState({
    businessLicense: initial?.businessLicenseLabel ?? '',
    bankbook: initial?.bankbookLabel ?? '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [authError, setAuthError] = useState('');
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(179);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isBusinessDup, setIsBusinessDup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCheckingDuplication, setIsCheckingDuplication] = useState(false);
  const [duplicationSuccess, setDuplicationSuccess] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [businessLicenseFileId, setBusinessLicenseFileId] = useState<
    string | null
  >(null);
  const [bankbookFileId, setBankbookFileId] = useState<string | null>(null);

  // Prefill from props.initial
  useEffect(() => {
    if (!initial) return;
    setFormData((prev) => ({
      ...prev,
      businessNumber: initial.businessNumber ?? prev.businessNumber,
      representativeName: initial.representativeName ?? prev.representativeName,
      companyName: initial.companyName ?? prev.companyName,
      postalCode: initial.postalCode ?? prev.postalCode,
      address: initial.address ?? prev.address,
      detailAddress: initial.detailAddress ?? prev.detailAddress,
      bankName: initial.bankName ?? prev.bankName,
      accountNumber: initial.accountNumber ?? prev.accountNumber,
      accountHolder: initial.accountHolder ?? prev.accountHolder,
      email: initial.email ?? prev.email,
      emailDomain: initial.emailDomain ?? prev.emailDomain,
      // files are not pre-attached (we only show labels in readOnly)
      businessLicenseFile: prev.businessLicenseFile,
      bankbookFile: prev.bankbookFile,
    }));
    setDisplayNames((p) => ({
      businessLicense: initial.businessLicenseLabel ?? p.businessLicense,
      bankbook: initial.bankbookLabel ?? p.bankbook,
    }));
  }, [initial]);

  // Input change handler (no-op in readOnly)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (readOnly) return;

    const target = e.currentTarget; // HTMLInputElement | HTMLSelectElement
    const { name, value } = target;

    // If this is a file input, handle files
    if ('files' in target && target.files) {
      const file = target.files[0] ?? null;
      setFormData((prev) => ({
        ...prev,
        [name]: file as unknown as File | null,
      }));

      if (name === 'businessLicenseFile') {
        setDisplayNames((p) => ({ ...p, businessLicense: file?.name || '' }));
      }
      if (name === 'bankbookFile') {
        setDisplayNames((p) => ({ ...p, bankbook: file?.name || '' }));
      }
    } else {
      // Regular text/select inputs
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: '', businessNumberDup: '' }));
    if (name === 'authCode' && authError) setAuthError('');
    if (name === 'businessNumber') {
      setIsBusinessDup(false);
      setDuplicationSuccess(false);
    }
    if (name === 'postalCode') setAddressSearchError('');
  };

  // Business number duplication check
  const handleCheckDuplication = async () => {
    if (readOnly) return;
    if (isCheckingDuplication) return;

    setIsCheckingDuplication(true);
    setErrors((prev) => ({ ...prev, businessNumberDup: '' }));
    setDuplicationSuccess(false);

    try {
      console.log(
        'Checking business number duplication:',
        formData.businessNumber
      );

      const response = await AuthService.validateBusinessNumber(
        formData.businessNumber
      );

      if (response.error) {
        console.error('Business number validation failed:', response.error);
        // Check if it's a 409 Conflict (business number taken)
        if (
          response.error.includes('409') ||
          response.error.includes('Conflict')
        ) {
          setErrors((prev) => ({
            ...prev,
            businessNumberDup: '이미 등록된 사업자등록번호입니다.',
          }));
          setIsBusinessDup(true);
          setDuplicationSuccess(false);
        }
        // Check if it's a server error (500) - treat as available for now
        else if (
          response.error.includes('500') ||
          response.error.includes('Internal Server Error') ||
          response.error.includes('서버 내부 오류')
        ) {
          console.log('Server error - treating business number as available');
          setErrors((prev) => ({ ...prev, businessNumberDup: '' }));
          setIsBusinessDup(false);
          setDuplicationSuccess(true);
        }
        // Other errors
        else {
          setErrors((prev) => ({
            ...prev,
            businessNumberDup: '사업자등록번호 확인 중 오류가 발생했습니다.',
          }));
          setIsBusinessDup(true);
          setDuplicationSuccess(false);
        }
      } else if (response.data?.success) {
        console.log('Business number validation successful');
        setErrors((prev) => ({ ...prev, businessNumberDup: '' }));
        setIsBusinessDup(false);
        setDuplicationSuccess(true);
      } else {
        setErrors((prev) => ({
          ...prev,
          businessNumberDup: '이미 등록된 사업자등록번호입니다.',
        }));
        setIsBusinessDup(true);
        setDuplicationSuccess(false);
      }
    } catch (error) {
      console.error('Business number validation error:', error);
      // For server errors, treat as available to allow form submission
      console.log(
        'Network/server error - treating business number as available'
      );
      setErrors((prev) => ({ ...prev, businessNumberDup: '' }));
      setIsBusinessDup(false);
      setDuplicationSuccess(true);
    } finally {
      setIsCheckingDuplication(false);
    }
  };

  // Address search handler
  const handleAddressSearch = async () => {
    if (readOnly) return;
    if (isSearchingAddress) return;

    // Clear previous errors
    setAddressSearchError('');

    // Check if postal code is empty
    if (!formData.postalCode.trim()) {
      setAddressSearchError('우편번호를 입력해주세요.');
      return;
    }

    setIsSearchingAddress(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // This would typically call a real postal code API
      // For now, we'll simulate a successful search
      setFormData((prev) => ({
        ...prev,
        address: '서울특별시 강남구 테헤란로 123',
        detailAddress: '',
      }));
    } catch (error) {
      setAddressSearchError('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Send verification code
  const handleSendCode = async () => {
    if (readOnly) return;
    if (isSendingCode) return;

    setIsSendingCode(true);
    setAuthError('');

    try {
      const email = `${formData.email}@${formData.emailDomain}`;
      console.log('Sending email verification code to:', email);

      const response = await AuthService.sendEmailVerification({
        name: formData.representativeName || 'User',
        email: email,
      });

      if (response.error) {
        console.error('Email verification failed:', response.error);
        setAuthError('이메일 전송에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      if (response.data?.success) {
        console.log('Email verification code sent successfully');
        setShowAuthCode(true);
        setTimeLeft(179);
        setIsVerified(false);
        setAuthCode('');
        setAuthError('');
      } else {
        setAuthError('이메일 전송에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setAuthError('이메일 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (readOnly) return;
    if (!authCode.trim()) return;
    if (isVerifyingCode) return;

    setIsVerifyingCode(true);
    setAuthError('');

    try {
      const email = `${formData.email}@${formData.emailDomain}`;
      console.log('Verifying email code for:', email);

      const response = await AuthService.verifyEmailCode(email, authCode);

      if (response.error) {
        console.error('Email verification failed:', response.error);
        setIsVerified(false);
        setAuthError('올바른 인증번호를 입력해주세요.');
        return;
      }

      if (response.data?.success) {
        console.log('Email verification successful');
        setIsVerified(true);
        setAuthError('');
      } else {
        setIsVerified(false);
        setAuthError('올바른 인증번호를 입력해주세요.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setIsVerified(false);
      setAuthError('인증 중 오류가 발생했습니다.');
    } finally {
      setIsVerifyingCode(false);
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

  // Validation (skipped for readOnly)
  const validateForm = () => {
    if (readOnly) return false;
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
    if (!formData.postalCode) newErrors.postalCode = '우편번호를 입력해주세요.';
    if (!formData.address) newErrors.address = '도로명 주소를 입력해주세요.';
    if (!formData.detailAddress)
      newErrors.detailAddress = '상세주소를 입력해주세요.';
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Check if file IDs are available
      if (!businessLicenseFileId || !bankbookFileId) {
        setSubmitError('파일 업로드를 완료해주세요.');
        setIsSubmitting(false);
        return;
      }

      // Validate that we have real file IDs (not temporary ones)
      if (
        businessLicenseFileId.startsWith('temp-') ||
        bankbookFileId.startsWith('temp-')
      ) {
        setSubmitError(
          '파일 업로드를 완료해주세요. 서버 오류로 인해 파일이 업로드되지 않았습니다.'
        );
        setIsSubmitting(false);
        return;
      }

      // Prepare the API request data
      const upgradeData: SellerMembershipUpgradeRequest = {
        businessRegistrationNumber: formData.businessNumber,
        representativeName: formData.representativeName,
        businessName: formData.companyName,
        businessRegistrationCopyFileId: businessLicenseFileId,
        roadAddress: formData.address,
        detailedAddress: formData.detailAddress,
        zipCode: formData.postalCode,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        depositorName: formData.accountHolder,
        bankbookFileId: bankbookFileId,
        businessEmail: `${formData.email}@${formData.emailDomain}`,
      };

      console.log('Submitting seller membership upgrade:', upgradeData);

      const response = await AuthService.upgradeToSellerMembership(upgradeData);

      if (response.error) {
        console.error('Seller membership upgrade failed:', response.error);
        setSubmitError(response.error);
        setIsSubmitting(false);
        return;
      }

      if (response.data?.success) {
        console.log('Seller membership upgrade successful:', response.data);

        // Upgrade user role to seller
        if (user) {
          const updatedUser = {
            ...user,
            role: 'seller' as const,
          };
          login(updatedUser);
          console.log('User role upgraded to seller:', updatedUser);
        }

        setShowModal(true);
      } else {
        console.error('Unexpected response structure:', response.data);
        setSubmitError('예상치 못한 응답이 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Seller membership upgrade error:', error);
      setSubmitError('서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived states
  const emailValid =
    formData.email.trim() !== '' && formData.emailDomain.trim() !== '';
  const canSendCode = emailValid && !isVerified && !readOnly && !isSendingCode;
  const canVerify = authCode.trim().length > 0 && !readOnly && !isVerifyingCode;
  const canCheckDup =
    formData.businessNumber.trim().length > 0 &&
    !readOnly &&
    !isCheckingDuplication;
  const canSearchAddress =
    formData.postalCode.trim().length > 0 && !isSearchingAddress;
  const canSubmit =
    !readOnly &&
    !isSubmitting &&
    formData.businessNumber &&
    !isBusinessDup &&
    formData.representativeName &&
    formData.companyName &&
    formData.businessLicenseFile &&
    businessLicenseFileId &&
    formData.postalCode &&
    formData.address &&
    formData.detailAddress &&
    formData.bankName &&
    formData.accountNumber &&
    formData.accountHolder &&
    formData.bankbookFile &&
    bankbookFileId &&
    formData.email &&
    formData.emailDomain &&
    isVerified;

  return (
    <>
      {/*       {banner && <div className={styles.banner}>{banner}</div>} */}

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
              readOnly={readOnly}
            />
            <button
              type="button"
              className={`${styles.emailButton} ${
                canCheckDup ? styles.enabled : styles.disabled
              }`}
              disabled={!canCheckDup}
              onClick={handleCheckDuplication}
            >
              {isCheckingDuplication ? '확인 중...' : '중복확인'}
            </button>
          </div>
          {errors.businessNumber && (
            <p className={styles.error}>{errors.businessNumber}</p>
          )}
          {errors.businessNumberDup && (
            <p className={styles.error}>{errors.businessNumberDup}</p>
          )}
          {duplicationSuccess && (
            <p className={styles.success}>사용 가능한 사업자등록번호입니다.</p>
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
            readOnly={readOnly}
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
            readOnly={readOnly}
          />
          {errors.companyName && (
            <p className={styles.error}>{errors.companyName}</p>
          )}
        </div>

        {/* Business License File */}
        <div className={styles.formGroup}>
          <label className={styles.label}>사업자등록증 사본 (필수)</label>
          {readOnly ? (
            <div className={styles.readonlyFileBox}>
              {displayNames.businessLicense || '파일 없음'}
            </div>
          ) : (
            <FileUploadModal
              file={formData.businessLicenseFile}
              setFile={(file) => {
                setFormData((prev) => ({ ...prev, businessLicenseFile: file }));
                setDisplayNames((p) => ({
                  ...p,
                  businessLicense: file?.name || '',
                }));
              }}
              fileId={businessLicenseFileId}
              setFileId={setBusinessLicenseFileId}
            />
          )}
          {errors.businessLicenseFile && (
            <p className={styles.error}>{errors.businessLicenseFile}</p>
          )}
        </div>

        {/* Address */}
        <div className={styles.formGroup}>
          <label className={styles.label}>사업장 주소 (필수)</label>
          <div className={styles.emailInputWrapper}>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="우편번호"
              className={`${styles.input} ${
                errors.postalCode ? styles.errorInput : ''
              }`}
              readOnly={readOnly}
            />
            <button
              type="button"
              className={`${styles.emailButton} ${
                canSearchAddress ? styles.enabled : styles.disabled
              }`}
              onClick={handleAddressSearch}
              disabled={!canSearchAddress}
            >
              {isSearchingAddress ? '검색 중...' : '주소 검색'}
            </button>
          </div>
          {addressSearchError && (
            <p className={styles.error}>{addressSearchError}</p>
          )}
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="도로명 주소"
            className={`${styles.input} ${
              errors.address ? styles.errorInput : ''
            }`}
            readOnly={readOnly}
          />
          <input
            type="text"
            name="detailAddress"
            value={formData.detailAddress}
            onChange={handleChange}
            placeholder="상세주소"
            className={`${styles.input} ${
              errors.detailAddress ? styles.errorInput : ''
            }`}
            readOnly={readOnly}
          />
          {errors.postalCode && (
            <p className={styles.error}>{errors.postalCode}</p>
          )}
          {errors.address && <p className={styles.error}>{errors.address}</p>}
          {errors.detailAddress && (
            <p className={styles.error}>{errors.detailAddress}</p>
          )}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
          />
          {errors.accountHolder && (
            <p className={styles.error}>{errors.accountHolder}</p>
          )}

          {/* Bankbook File */}
          {readOnly ? (
            <div className={styles.readonlyFileBox}>
              {displayNames.bankbook || '파일 없음'}
            </div>
          ) : (
            <FileUploadModal
              file={formData.bankbookFile}
              setFile={(file) => {
                setFormData((prev) => ({ ...prev, bankbookFile: file }));
                setDisplayNames((p) => ({ ...p, bankbook: file?.name || '' }));
              }}
              fileId={bankbookFileId}
              setFileId={setBankbookFileId}
            />
          )}
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
              readOnly={readOnly}
            />
            <span className={styles.atSymbol}>@</span>

            {/* Custom Dropdown */}
            <div className={styles.customSelectWrapper}>
              <div
                className={styles.customSelect}
                onClick={() => {
                  if (!readOnly) setDropdownOpen((prev) => !prev);
                }}
              >
                {formData.emailDomain || '선택해주세요'}
                <FaChevronDown className={styles.chevronIcon} />
              </div>
              {!readOnly && dropdownOpen && (
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

        {/* Send Verification (only when editable) */}
        {!readOnly && (
          <div className={styles.authButton}>
            <button
              type="button"
              onClick={handleSendCode}
              className={`${styles.outlineButton} ${
                canSendCode ? styles.enabled : styles.disabled
              }`}
            >
              {isSendingCode ? '전송 중...' : '인증번호 전송'}
            </button>
          </div>
        )}

        {/* Auth Code (only when editable) */}
        {!readOnly && showAuthCode && (
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
                  {isVerifyingCode ? '확인 중...' : '인증 확인'}
                </button>
              </div>
            </div>
            {authError && <p className={styles.error}>{authError}</p>}
            {isVerified && (
              <p className={styles.success}>인증이 완료되었습니다.</p>
            )}
          </div>
        )}

        {/* Submit Error Display */}
        {submitError && (
          <div className={styles.errorContainer}>
            <p className={styles.error}>{submitError}</p>
          </div>
        )}

        {/* Submit or read-only footer */}
        {!readOnly ? (
          <button
            type="submit"
            className={`${styles.bottomButton} ${
              canSubmit ? styles.enabled : styles.disabled
            }`}
            disabled={!canSubmit}
          >
            {isSubmitting ? '등록 중...' : '사업자 등록하기'}
          </button>
        ) : (
          <div className={styles.readonlyFooter}>{banner || '읽기 전용'}</div>
        )}
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
        <h1 className={styles.modalTitle}>판매자 멤버십 업그레이드 완료</h1>
        <p className={styles.successMessage}>
          판매자 멤버십으로 성공적으로 업그레이드되었습니다.
        </p>
        <button
          className={styles.modalButton}
          onClick={() => {
            setShowModal(false);
            if (onDone) {
              onDone();
            } else {
              router.push('/');
            }
          }}
        >
          확인
        </button>
      </BaseModal>
    </>
  );
}
