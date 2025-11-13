'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './MembershipInformation.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FiCamera, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { PAGE_URLS } from '@/app/utils/page_url';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import { AuthService } from '@/app/api/services/client/auth/authService';
import { AddressService } from '@/app/api/services/client/addressService/addressService';
import { AddressSearchResult } from '@/app/api/types/address/addressSearch';
import {
  MemberSignupDto,
  LOGIN_TYPES,
} from '@/app/api/types/auth/MemberSignupDto';
import { EmailVerificationRequest } from '@/app/api/types/auth/EmailVerification';
import { Scanner } from '@yudiel/react-qr-scanner';

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
    birthDate: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [emailValidationStatus, setEmailValidationStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'error'
  >('idle');
  const [emailValidationMessage, setEmailValidationMessage] = useState('');

  // Email verification states
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(179);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // QR Scanner states
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanError, setQrScanError] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Username validation states
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);
  const [usernameValidationStatus, setUsernameValidationStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'error'
  >('idle');
  const [usernameValidationMessage, setUsernameValidationMessage] =
    useState('');

  // Address search states
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState<unknown[]>(
    []
  );
  const [showAddressResults, setShowAddressResults] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug modal state
  useEffect(() => {
    console.log('showModal state changed:', showModal);
  }, [showModal]);

  // Debounced username validation
  const validateUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameValidationStatus('idle');
      setUsernameValidationMessage('');
      return;
    }

    if (!/^[a-z0-9]+$/.test(username)) {
      setUsernameValidationStatus('error');
      setUsernameValidationMessage(
        '아이디는 영문 소문자와 숫자만 사용할 수 있습니다.'
      );
      return;
    }

    setIsValidatingUsername(true);
    setUsernameValidationStatus('checking');
    setUsernameValidationMessage('확인 중...');

    try {
      const response = await AuthService.validateIdentifier(username);

      if (response.error) {
        if (
          response.error.includes('409') ||
          response.error.includes('Conflict')
        ) {
          setUsernameValidationStatus('taken');
          setUsernameValidationMessage('이미 사용 중인 아이디입니다.');
        } else if (
          response.error.includes('400') ||
          response.error.includes('Bad Request')
        ) {
          setUsernameValidationStatus('error');
          setUsernameValidationMessage('아이디 형식이 올바르지 않습니다.');
        } else {
          setUsernameValidationStatus('error');
          setUsernameValidationMessage('확인 중 오류가 발생했습니다.');
        }
      } else if (response.data?.success) {
        setUsernameValidationStatus('available');
        setUsernameValidationMessage('사용 가능한 아이디입니다.');
      } else {
        setUsernameValidationStatus('taken');
        setUsernameValidationMessage('이미 사용 중인 아이디입니다.');
      }
    } catch (err) {
      console.error('Username validation error:', err);
      setUsernameValidationStatus('error');
      setUsernameValidationMessage('확인 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingUsername(false);
    }
  }, []);

  // Debounce username validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username) {
        validateUsername(formData.username);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, validateUsername]);

  // Debounced email validation
  const validateEmailAvailability = useCallback(async () => {
    const { email, emailDomain } = formData;
    if (!email || !emailDomain) {
      setEmailValidationStatus('idle');
      setEmailValidationMessage('');
      return;
    }

    const fullEmail = `${email}@${emailDomain}`;
    setEmailValidationStatus('checking');
    setEmailValidationMessage('이메일 확인 중...');

    try {
      const res = await AuthService.validateEmailAvailability(fullEmail);
      if (res.error) {
        setEmailValidationStatus('taken');
        setEmailValidationMessage('이미 사용 중인 이메일입니다.');
      } else if (res.data?.success) {
        setEmailValidationStatus('available');
        setEmailValidationMessage('사용 가능한 이메일입니다.');
      } else {
        setEmailValidationStatus('taken');
        setEmailValidationMessage('이미 사용 중인 이메일입니다.');
      }
    } catch {
      setEmailValidationStatus('error');
      setEmailValidationMessage('이메일 확인 중 오류가 발생했습니다.');
    }
  }, [formData]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (formData.email && formData.emailDomain) {
        validateEmailAvailability();
      }
    }, 600); // 0.6s debounce
    return () => clearTimeout(delay);
  }, [formData.email, formData.emailDomain, validateEmailAvailability]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', general: '' }));

    if (name === 'username') {
      setUsernameValidationStatus('idle');
      setUsernameValidationMessage('');
    }

    if (name === 'postalCode') {
      setAddressSearchError('');
    }
  };

  // QR Scanner functions
  const handleQRScan = (detectedCodes: unknown[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const firstCode = detectedCodes[0];
      const result = (firstCode as { rawValue?: string })?.rawValue;
      console.log('QR Code scanned:', result);

      if (!result) {
        console.log('No QR code data found');
        return;
      }

      let referralCode = '';

      try {
        // Try to parse as JSON first
        const parsedData = JSON.parse(result);
        console.log('Parsed JSON data:', parsedData);

        // If it's a JSON object, extract the referralCode
        if (
          parsedData &&
          typeof parsedData === 'object' &&
          parsedData.referralCode
        ) {
          referralCode = parsedData.referralCode;
          console.log('Found referralCode in JSON:', referralCode);
        } else {
          // If no referralCode field, use the whole result
          referralCode = result;
          console.log('No referralCode field found, using full result');
        }
      } catch {
        // If it's not JSON, use the result as is
        referralCode = result;
        console.log('Not JSON, using raw result:', referralCode);
      }

      console.log('Extracted referral code:', referralCode);

      // Update the referral input with the extracted referral code
      setFormData((prev) => ({
        ...prev,
        referral: referralCode,
      }));

      // Close the scanner
      setShowQRScanner(false);
      setQrScanError(null);
    }
  };

  const handleQRScanError = (error: unknown) => {
    console.error('QR Scan error:', error);
    setQrScanError('QR 코드 스캔 중 오류가 발생했습니다.');
  };

  const openQRScanner = () => {
    setShowQRScanner(true);
    setQrScanError(null);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
    setQrScanError(null);
  };

  // Send verification code
  const handleSendCode = async () => {
    if (isSendingCode) return;

    setIsSendingCode(true);

    try {
      const emailAddress = `${formData.email}@${formData.emailDomain}`;

      const verificationData: EmailVerificationRequest = {
        name: formData.name || 'User',
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

      // We no longer store a local serverCode (it was unused). Just proceed to show the code field & timer.
      setShowAuthCode(true);
      setTimeLeft(179);
      setIsVerified(false);
      setErrors((prev) => ({ ...prev, email: '' }));

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
    if (isVerifyingCode) return;

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

  // Address search handler
  const handleAddressSearch = async () => {
    console.log('handleAddressSearch called');
    if (isSearchingAddress) return;

    // Clear previous errors and results
    setAddressSearchError('');
    setAddressSearchResults([]);
    setShowAddressResults(false);

    if (!formData.postalCode.trim()) {
      setAddressSearchError('주소 키워드를 입력해주세요.');
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
  const handleAddressSelect = (selectedAddress: unknown) => {
    const formattedAddress = AddressService.formatAddress(
      selectedAddress as AddressSearchResult
    );
    const postalCode = AddressService.extractPostalCode(
      selectedAddress as AddressSearchResult
    );

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

  // Countdown timer
  useEffect(() => {
    if (!showAuthCode || timeLeft <= 0 || isVerified) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [showAuthCode, timeLeft, isVerified]);

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
    } else if (usernameValidationStatus === 'taken') {
      newErrors.username = '이미 사용 중인 아이디입니다.';
    } else if (usernameValidationStatus === 'checking') {
      newErrors.username = '아이디 확인 중입니다. 잠시만 기다려주세요.';
    } else if (usernameValidationStatus === 'error') {
      newErrors.username = '아이디 확인 중 오류가 발생했습니다.';
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
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) {
      console.log('Already submitting, please wait...');
      return;
    }

    setErrors((prev) => ({ ...prev, general: '' }));

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      setIsSubmitting(false);
      return;
    }

    console.log('Starting form submission...');
    setIsSubmitting(true);

    try {
      const signupData: MemberSignupDto = {
        identifier: formData.username.trim(),
        password: formData.password,
        loginType: LOGIN_TYPES.GENERAL,
        email: `${formData.email.trim()}@${formData.emailDomain}`,
        phoneNumber: formData.phone.trim(),
        zipCode: formData.postalCode.trim(),
        roadAddress: formData.address.trim(),
        detailedAddress: formData.detailAddress.trim(),
        ...(formData.name?.trim() && { name: formData.name.trim() }),
        ...(formData.name?.trim() && { nickname: formData.name.trim() }),
        ...(formData.birthDate && { birthDate: formData.birthDate }),
        ...(formData.referral?.trim() && {
          referralCode: formData.referral.trim(),
        }),
      };

      console.log('Form data before mapping:', formData);
      console.log('Mapped signup data:', signupData);

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

      console.log(
        'Final signup data being sent to API:',
        JSON.stringify(signupData, null, 2)
      );

      const response = await AuthService.signupGeneral(signupData);

      if (response.error) {
        console.error('Signup failed:', response.error);

        let errorMessage = response.error;

        if (typeof response.error === 'string') {
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

      let errorMessage = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';

      if (error instanceof Error) {
        const errorString = error.message;

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

      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
      setIsSubmitting(false);
    }
  };

  const canSendCode = formData.email && formData.emailDomain;
  const canVerify = !!authCode;
  const canSearchAddress =
    formData.postalCode.trim().length > 0 && !isSearchingAddress;

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
    formData.detailAddress &&
    isVerified &&
    usernameValidationStatus === 'available' &&
    !isValidatingUsername;

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
          {usernameValidationMessage && (
            <p
              className={`${styles.validationMessage} ${
                usernameValidationStatus === 'available'
                  ? styles.success
                  : usernameValidationStatus === 'taken'
                  ? styles.error
                  : usernameValidationStatus === 'checking'
                  ? styles.checking
                  : styles.error
              }`}
            >
              {usernameValidationMessage}
            </p>
          )}
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

          {/* Real-time validation message should be here, outside the select */}
          {emailValidationMessage && (
            <p
              className={`${styles.validationMessage} ${
                emailValidationStatus === 'available'
                  ? styles.success
                  : emailValidationStatus === 'checking'
                  ? styles.checking
                  : styles.error
              }`}
            >
              {emailValidationMessage}
            </p>
          )}

          {errors.email && <p className={styles.error}>{errors.email}</p>}

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
                {!isVerified && (
                  <span className={styles.timer}>{formatTime(timeLeft)}</span>
                )}
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
              onKeyDown={handleAddressKeyDown}
              placeholder="주소 키워드 (예: 서울특별시 동대문구)"
              className={styles.input}
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
                    {AddressService.formatAddress(
                      result as AddressSearchResult
                    )}
                  </div>
                  {(() => {
                    const zipCode = AddressService.extractPostalCode(
                      result as AddressSearchResult
                    );
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
          {addressSearchError && (
            <p className={styles.error}>{addressSearchError}</p>
          )}
          {errors.address && <p className={styles.error}>{errors.address}</p>}
        </div>

        {/* Seller ID Input */}
        <div className={styles.formGroup}>
          <label className={styles.label}>추천인 코드</label>
          <div className={styles.sellerIdInputWrapper}>
            <input
              type="text"
              name="referral"
              value={formData.referral}
              onChange={handleChange}
              placeholder="판매자ID 입력 혹은 QR코드를 스캔해 주세요"
              className={styles.sellerIdInput}
            />
            <button
              type="button"
              className={styles.qrScanButton}
              onClick={openQRScanner}
            >
              <FiCamera className={styles.qrScanIcon} />
            </button>
          </div>
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
              setTimeout(() => {
                router.push('/client/login');
              }, 100);
            }}
          >
            로그인 페이지로 이동
          </button>
        </BaseModal>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        /*  <BaseModal open={showQRScanner} onClose={closeQRScanner}> */
        <div className={styles.qrScannerModal}>
          <div className={styles.qrScannerContent}>
            <div className={styles.qrScannerHeader}>
              <h3>QR 코드 스캔</h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeQRScanner}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className={styles.qrScannerContainer}>
              <Scanner
                onScan={handleQRScan}
                onError={handleQRScanError}
                styles={{
                  container: {
                    width: '100%',
                    height: '300px',
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
                constraints={{
                  facingMode: 'environment', // Use back camera
                }}
              />
            </div>

            {qrScanError && (
              <div className={styles.qrScanError}>{qrScanError}</div>
            )}

            <div className={styles.qrScannerInstructions}>
              <p>QR 코드를 카메라에 비춰주세요</p>
            </div>
          </div>
        </div>
        /*   </BaseModal> */
      )}
    </>
  );
}
