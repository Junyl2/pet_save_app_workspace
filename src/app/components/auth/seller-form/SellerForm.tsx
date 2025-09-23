'use client';
import { useState, useEffect } from 'react';
import styles from './SellerForm.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import FileUploadModal from './FileUploadModal';
import { FaChevronDown } from 'react-icons/fa';
import { useUser } from '@/app/context/userContext';
import { AuthService } from '@/app/api/services/client/auth/authService';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';
import { FileService } from '@/app/api/services/client/fileService/fileService';
import { AddressService } from '@/app/api/services/client/addressService/addressService';
import { BusinessRegistrationRequest } from '@/app/api/types/auth/BusinessRegistration';
import { EmailVerificationRequest } from '@/app/api/types/auth/EmailVerification';

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
  const { updateUserRole } = useUser();

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [businessLicenseFileId, setBusinessLicenseFileId] = useState<
    string | null
  >(null);
  const [businessLicenseEncryptedId, setBusinessLicenseEncryptedId] = useState<
    string | null
  >(null);
  const [bankbookFileId, setBankbookFileId] = useState<string | null>(null);
  const [bankbookEncryptedId, setBankbookEncryptedId] = useState<string | null>(
    null
  );
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState<string | null>(
    null
  );
  const [addressSearchResults, setAddressSearchResults] = useState<any[]>([]);
  const [showAddressResults, setShowAddressResults] = useState(false);

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
        [name]: (file as unknown as File) ?? null,
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
    setIsBusinessDup(false);
  };

  // Business number duplication check
  const handleCheckDuplication = async () => {
    if (readOnly) return;

    try {
      console.log(
        'Checking business number availability:',
        formData.businessNumber
      );

      const response = await AuthService.validateBusinessNumber(
        formData.businessNumber
      );

      if (response.error) {
        // Check if it's a 409 conflict (already taken) or other error
        if (
          response.error.includes('409') ||
          response.error.includes('Conflict') ||
          response.error.includes('이미 등록된')
        ) {
          setErrors((prev) => ({
            ...prev,
            businessNumberDup: '이미 등록된 사업자등록번호입니다.',
          }));
          setIsBusinessDup(true);
        } else {
          // Server error or other issue
          setErrors((prev) => ({
            ...prev,
            businessNumberDup:
              '사업자등록번호 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          }));
          setIsBusinessDup(true);
        }
      } else {
        // Business number is available
        setErrors((prev) => ({ ...prev, businessNumberDup: '' }));
        setSuccessMessage('사용 가능한 사업자등록번호입니다.');
        setIsBusinessDup(false);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Business number check error:', error);
      setErrors((prev) => ({
        ...prev,
        businessNumberDup:
          '사업자등록번호 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      }));
      setIsBusinessDup(true);
    }
  };

  // Send verification code
  const handleSendCode = async () => {
    if (readOnly) return;

    setIsSendingCode(true);
    setAuthError('');

    try {
      const email = `${formData.email}@${formData.emailDomain}`;
      console.log('Sending verification code to:', email);

      // Validate that representative name is provided
      if (!formData.representativeName.trim()) {
        setAuthError('대표자명을 먼저 입력해주세요.');
        return;
      }

      const verificationData: EmailVerificationRequest = {
        name: formData.representativeName, // Using representative name as the name
        email: email,
      };

      const response = await AuthService.sendEmailVerification(
        verificationData
      );

      if (response.error) {
        console.error('Email verification failed:', response.error);
        setAuthError('인증번호 전송에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      console.log('Email verification sent successfully:', response.data);
      setShowAuthCode(true);
      setTimeLeft(179);
      setIsVerified(false);
      setAuthCode('');
      setSuccessMessage('인증번호가 전송되었습니다.');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Send verification code error:', error);
      setAuthError('인증번호 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (readOnly) return;

    setIsVerifyingCode(true);
    setAuthError('');

    try {
      const email = `${formData.email}@${formData.emailDomain}`;
      console.log('Verifying code for email:', email, 'with code:', authCode);

      const response = await AuthService.verifyEmailCode(email, authCode);

      if (response.error) {
        console.error('Email verification failed:', response.error);
        setAuthError('올바른 인증번호를 입력해주세요.');
        setIsVerified(false);
        return;
      }

      console.log('Email verification successful:', response.data);
      setIsVerified(true);
      setSuccessMessage('인증이 완료되었습니다.');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Verify code error:', error);
      setAuthError('인증번호 확인 중 오류가 발생했습니다.');
      setIsVerified(false);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Address search handler
  const handleAddressSearch = async () => {
    console.log('handleAddressSearch called');
    if (isSearchingAddress) return;

    // Clear previous errors and results
    setAddressSearchError('');
    setAddressSearchResults([]);
    setShowAddressResults(false);

    // Check if postal code is empty
    if (!formData.postalCode.trim()) {
      setAddressSearchError('우편번호를 입력해주세요.');
      return;
    }

    console.log('Starting address search for:', formData.postalCode);
    setIsSearchingAddress(true);

    try {
      // Use the new AddressService to search for addresses
      const response = await AddressService.searchAddressByKeyword(
        formData.postalCode,
        1,
        10
      );

      console.log('Address search response in form:', response);

      if (response.error) {
        console.log('Address search error:', response.error);
        setAddressSearchError(response.error);
        return;
      }

      if (
        response.data &&
        response.data.documents &&
        response.data.documents.length > 0
      ) {
        console.log(
          'Address search successful, found',
          response.data.documents.length,
          'results'
        );
        setAddressSearchResults(response.data.documents);
        setShowAddressResults(true);
      } else {
        console.log('No address search results found');
        setAddressSearchError(
          '검색 결과가 없습니다. 다른 키워드로 검색해보세요.'
        );
      }
    } catch (error) {
      console.error('Address search error:', error);
      setAddressSearchError('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Handle Enter key press in address input
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      console.log(
        'Enter key pressed in address input, preventing form submission'
      );
      handleAddressSearch();
    }
  };

  // Handle address selection from search results
  const handleAddressSelect = (selectedAddress: any) => {
    const formattedAddress = AddressService.formatAddress(selectedAddress);
    const postalCode = AddressService.extractPostalCode(selectedAddress);
    const coordinates = AddressService.extractCoordinates(selectedAddress);

    setFormData((prev) => ({
      ...prev,
      address: formattedAddress,
      postalCode: postalCode || '', // Clear postal code if no zip code found
      detailAddress: '',
    }));

    setShowAddressResults(false);
    setAddressSearchResults([]);
    setAddressSearchError('');
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

    // Prepare data for validation
    const registrationData = {
      businessRegistrationNumber: formData.businessNumber,
      representativeName: formData.representativeName,
      businessName: formData.companyName,
      businessRegistrationCopyFileId:
        businessLicenseEncryptedId || businessLicenseFileId || '',
      roadAddress: formData.address,
      detailedAddress: formData.detailAddress,
      zipCode: formData.postalCode,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      depositorName: formData.accountHolder,
      bankbookFileId: bankbookEncryptedId || bankbookFileId || '',
      businessEmail: `${formData.email}@${formData.emailDomain}`,
      x: 126.978,
      y: 37.5665,
    };

    // Use the service validation
    const validation =
      BusinessRegistrationService.validateBusinessRegistrationData(
        registrationData
      );

    if (!validation.isValid) {
      const newErrors: { [key: string]: string } = {};

      // Map validation errors to form field errors
      validation.errors.forEach((error) => {
        if (error.includes('Business registration number')) {
          newErrors.businessNumber = '사업자등록번호를 입력해주세요.';
        } else if (error.includes('Representative name')) {
          newErrors.representativeName = '대표자명을 입력해주세요.';
        } else if (error.includes('Business name')) {
          newErrors.companyName = '상호명을 입력해주세요.';
        } else if (error.includes('Business registration copy file')) {
          newErrors.businessLicenseFile = '사업자등록증 사본을 첨부해주세요.';
        } else if (error.includes('Road address')) {
          newErrors.address = '도로명 주소를 입력해주세요.';
        } else if (error.includes('Detailed address')) {
          newErrors.detailAddress = '상세주소를 입력해주세요.';
        } else if (error.includes('ZIP code')) {
          newErrors.postalCode = '우편번호를 입력해주세요.';
        } else if (error.includes('Bank name')) {
          newErrors.bankName = '은행명을 입력해주세요.';
        } else if (error.includes('Account number')) {
          newErrors.accountNumber = '계좌번호를 입력해주세요.';
        } else if (error.includes('Depositor name')) {
          newErrors.accountHolder = '예금주명을 입력해주세요.';
        } else if (error.includes('Bankbook file')) {
          newErrors.bankbookFile = '통장 사본을 첨부해주세요.';
        } else if (error.includes('Business email')) {
          newErrors.email = '이메일을 입력해주세요.';
        }
      });

      // Additional form-specific validations
      if (isBusinessDup) {
        newErrors.businessNumberDup = '이미 등록된 사업자등록번호입니다.';
      }
      if (!isVerified) {
        newErrors.email = '이메일 인증을 완료해주세요.';
      }

      setErrors(newErrors);
      return false;
    }

    // Additional form-specific validations
    const newErrors: { [key: string]: string } = {};
    if (isBusinessDup) {
      newErrors.businessNumberDup = '이미 등록된 사업자등록번호입니다.';
    }
    if (!isVerified) {
      newErrors.email = '이메일 인증을 완료해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log('Submitting seller form:', { ...formData, status });

      // Verify files exist on server before submission
      if (businessLicenseEncryptedId) {
        const businessLicenseInfo = await FileService.getFileInfo(
          businessLicenseEncryptedId
        );
        if (businessLicenseInfo.error || !businessLicenseInfo.data?.data) {
          throw new Error(
            '사업자등록증 파일을 찾을 수 없습니다. 다시 업로드해주세요.'
          );
        }
      }

      if (bankbookEncryptedId) {
        const bankbookInfo = await FileService.getFileInfo(bankbookEncryptedId);
        if (bankbookInfo.error || !bankbookInfo.data?.data) {
          throw new Error(
            '통장 사본 파일을 찾을 수 없습니다. 다시 업로드해주세요.'
          );
        }
      }

      const registrationData: BusinessRegistrationRequest = {
        businessRegistrationNumber: formData.businessNumber,
        representativeName: formData.representativeName,
        businessName: formData.companyName,
        businessRegistrationCopyFileId:
          businessLicenseEncryptedId || businessLicenseFileId || '',
        roadAddress: formData.address,
        detailedAddress: formData.detailAddress,
        zipCode: formData.postalCode,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        depositorName: formData.accountHolder,
        bankbookFileId: bankbookEncryptedId || bankbookFileId || '',
        businessEmail: `${formData.email}@${formData.emailDomain}`,
        x: 126.978, // Default longitude for Seoul, Korea
        y: 37.5665, // Default latitude for Seoul, Korea
      };

      console.log('Sending business registration request:', registrationData);
      const response =
        await BusinessRegistrationService.submitBusinessRegistration(
          registrationData
        );

      if (response.error) {
        console.error('Business registration failed:', response.error);

        // Handle 409 Conflict (already registered)
        if (
          response.error.includes('409') ||
          response.error.includes('이미 가게를 등록했습니다')
        ) {
          console.log('User is already registered as seller, updating role...');
          updateUserRole('seller');
          setShowModal(true);

          // Force page refresh after 2 seconds to ensure UI updates
          setTimeout(() => {
            window.location.href = '/client/pages/homepage';
          }, 2000);
          return;
        }

        throw new Error(response.error);
      }

      console.log('Business registration successful:', response.data);
      updateUserRole('seller');
      setShowModal(true);

      // Force page refresh after 2 seconds to ensure UI updates
      setTimeout(() => {
        window.location.href = '/client/pages/homepage';
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : '등록 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived states
  const emailValid =
    formData.email.trim() !== '' && formData.emailDomain.trim() !== '';
  const canSendCode = emailValid && !isVerified && !readOnly && !isSendingCode;
  const canVerify = authCode.trim().length > 0 && !readOnly && !isVerifyingCode;
  const canCheckDup = formData.businessNumber.trim().length > 0 && !readOnly;
  const canSearchAddress =
    formData.postalCode.trim().length > 0 && !readOnly && !isSearchingAddress;
  const canSubmit =
    !readOnly &&
    !isSubmitting &&
    formData.businessNumber &&
    !isBusinessDup &&
    formData.representativeName &&
    formData.companyName &&
    (businessLicenseFileId || businessLicenseEncryptedId) &&
    formData.postalCode &&
    formData.address &&
    formData.detailAddress &&
    formData.bankName &&
    formData.accountNumber &&
    formData.accountHolder &&
    (bankbookFileId || bankbookEncryptedId) &&
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
              중복확인
            </button>
          </div>
          {errors.businessNumber && (
            <p className={styles.error}>{errors.businessNumber}</p>
          )}
          {errors.businessNumberDup && (
            <p className={styles.error}>{errors.businessNumberDup}</p>
          )}
          {successMessage && <p className={styles.success}>{successMessage}</p>}
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
              onFileUploaded={(fileId, encryptedId) => {
                setBusinessLicenseFileId(fileId);
                setBusinessLicenseEncryptedId(encryptedId);
              }}
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
              onKeyDown={handleAddressKeyDown}
              placeholder="주소 키워드 (예: 서울특별시 동대문구)"
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

          {/* Address Search Results */}
          {showAddressResults && addressSearchResults.length > 0 && (
            <div className={styles.addressResults}>
              <div className={styles.addressResultsHeader}>
                검색 결과 ({addressSearchResults.length}개)
              </div>
              {addressSearchResults.map((result, index) => (
                <div
                  key={index}
                  className={styles.addressResultItem}
                  onClick={() => handleAddressSelect(result)}
                >
                  <div className={styles.addressResultMain}>
                    {AddressService.formatAddress(result)}
                  </div>
                  {(() => {
                    const zipCode = AddressService.extractPostalCode(result);
                    return zipCode ? (
                      <div className={styles.addressResultPostal}>
                        우편번호: {zipCode}
                      </div>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
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
          {addressSearchError && (
            <p className={styles.error}>{addressSearchError}</p>
          )}
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
              onFileUploaded={(fileId, encryptedId) => {
                setBankbookFileId(fileId);
                setBankbookEncryptedId(encryptedId);
              }}
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
              disabled={!canSendCode}
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
                  disabled={!canVerify}
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

        {/* Submit Error */}
        {errors.submit && (
          <div className={styles.errorContainer}>
            <p className={styles.error}>{errors.submit}</p>
          </div>
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
        <h1 className={styles.modalTitle}>사업자 등록 완료</h1>
        <p className={styles.successMessage}>정상적으로 등록되었습니다.</p>
        <button
          className={styles.modalButton}
          onClick={() => {
            setShowModal(false);
            if (onDone) {
              onDone();
            } else {
              router.push('/client/pages/homepage');
            }
          }}
        >
          확인
        </button>
      </BaseModal>
    </>
  );
}
