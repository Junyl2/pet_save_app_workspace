'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './SellerForm.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import FileUploadModal from './FileUploadModal';
import { FaChevronDown } from 'react-icons/fa';
import { useUser } from '@/app/context/userContext';
import { AuthService } from '@/app/api/services/client/auth/authService';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';
import { BusinessFileService } from '@/app/api/services/client/fileService/businessFileService';
import { AddressService } from '@/app/api/services/client/addressService/addressService';
import { BusinessService } from '@/app/api/services/client/businessService/businessService';
import { BusinessRegistrationRequest } from '@/app/api/types/auth/BusinessRegistration';
import { EmailVerificationRequest } from '@/app/api/types/auth/EmailVerification';
import { BusinessRegistration } from '@/app/api/types/business/business';
import { AddressSearchResult } from '@/app/api/types/address/addressSearch';

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
  x: number;
  y: number;
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
  const { updateUserRole, user } = useUser();

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
    x: 0,
    y: 0,
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
  const [emailValidationStatus, setEmailValidationStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'error'
  >('idle');
  const [emailValidationMessage, setEmailValidationMessage] = useState('');
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
  const [businessRegistrationData, setBusinessRegistrationData] =
    useState<BusinessRegistration | null>(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState<string | null>(
    null
  );
  const [addressSearchResults, setAddressSearchResults] = useState<
    AddressSearchResult[]
  >([]);
  const [showAddressResults, setShowAddressResults] = useState(false);

  // Business number normalization function for display (XXX-XX-XXXXX format)
  const normalizeBusinessNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // If we have 10 digits, format as XXX-XX-XXXXX
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }

    // If we have less than 10 digits, return as is (user is still typing)
    if (digits.length < 10) {
      return digits;
    }

    // If we have more than 10 digits, truncate to 10 and format
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
  };

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
      let processedValue = value;

      // Normalize business number input
      if (name === 'businessNumber') {
        processedValue = normalizeBusinessNumber(value);
      }

      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }

    setErrors((prev) => {
      const newErrors = { ...prev, [name]: '' };
      // Only clear business number duplication error if business number field is being changed
      if (name === 'businessNumber') {
        newErrors.businessNumberDup = '';
      }
      return newErrors;
    });
    if (name === 'authCode' && authError) setAuthError('');
    // Only reset business duplication state if the business number field is being changed
    if (name === 'businessNumber') {
      setIsBusinessDup(false);
    }
    // Reset email validation status when email or emailDomain changes
    if (name === 'email' || name === 'emailDomain') {
      setEmailValidationStatus('idle');
      setEmailValidationMessage('');
    }
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
        BusinessRegistrationService.normalizeBusinessRegistrationNumber(
          formData.businessNumber
        )
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
  const handleAddressSelect = (selectedAddress: AddressSearchResult) => {
    const formattedAddress = AddressService.formatAddress(selectedAddress);
    const postalCode = AddressService.extractPostalCode(selectedAddress);
    const coordinates = AddressService.extractCoordinates(selectedAddress);

    const x = parseFloat(coordinates.x) || 0;
    const y = parseFloat(coordinates.y) || 0;

    console.log('Address selected with coordinates:', {
      address: formattedAddress,
      postalCode,
      x,
      y,
    });

    setFormData((prev) => ({
      ...prev,
      address: formattedAddress,
      postalCode: postalCode || '', // Clear postal code if no zip code found
      detailAddress: '',
      x,
      y,
    }));

    setShowAddressResults(false);
    setAddressSearchResults([]);
    setAddressSearchError('');
  };

  // Countdown
  useEffect(() => {
    if (!showAuthCode || timeLeft <= 0 || isVerified) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [showAuthCode, timeLeft, isVerified]);

  // Fetch business registration data if user has pending status
  useEffect(() => {
    const fetchBusinessRegistration = async () => {
      if (
        user?.businessApprovalStatus === 'PENDING' &&
        !businessRegistrationData
      ) {
        try {
          console.log(
            '🔄 Fetching business registration data for pending user...'
          );

          const response = await BusinessService.getMyBusinessRegistration();

          if (response.data?.success && response.data.data) {
            const businessData = response.data.data;
            console.log('✅ Business registration data fetched:', businessData);
            setBusinessRegistrationData(businessData);

            // Pre-fill form with existing data
            setFormData({
              businessNumber: businessData.businessRegistrationNumber || '',
              representativeName: businessData.representativeName || '',
              companyName: businessData.businessName || '',
              businessLicenseFile: null,
              postalCode: businessData.zipCode || '',
              address: businessData.roadAddress || '',
              detailAddress: businessData.detailedAddress || '',
              bankName: businessData.bankName || '',
              accountNumber: businessData.accountNumber || '',
              accountHolder: businessData.depositorName || '',
              bankbookFile: null,
              email: businessData.businessEmail?.split('@')[0] || '',
              emailDomain: businessData.businessEmail?.split('@')[1] || '',
              x: businessData.longitude || 0,
              y: businessData.latitude || 0,
            });

            // Set file display names
            setDisplayNames({
              businessLicense: '사업자등록증',
              bankbook: '통장사본',
            });

            // Set file IDs for display
            if (businessData.businessRegistrationCopy) {
              setBusinessLicenseFileId(businessData.businessRegistrationCopy);
            }
            if (businessData.bankbook) {
              setBankbookFileId(businessData.bankbook);
            }
          } else {
            console.log('No business registration data found');
          }
        } catch (error) {
          console.error('❌ Error fetching business registration:', error);
        }
      }
    };

    fetchBusinessRegistration();
  }, [user?.businessApprovalStatus, businessRegistrationData]);

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

    // Quick check: if business number is empty, fail immediately
    if (!formData.businessNumber || !formData.businessNumber.trim()) {
      console.log(
        'Business number is empty in validateForm:',
        formData.businessNumber
      );
      setErrors({ businessNumber: '사업자등록번호를 입력해주세요.' });
      return false;
    }

    // Prepare data for validation
    const registrationData = {
      businessRegistrationNumber:
        BusinessRegistrationService.normalizeBusinessRegistrationNumber(
          formData.businessNumber
        ),
      representativeName: formData.representativeName,
      businessName: formData.companyName,
      businessRegistrationCopyFileId: businessLicenseEncryptedId || '',
      roadAddress: formData.address,
      detailedAddress: formData.detailAddress,
      zipCode: formData.postalCode,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      depositorName: formData.accountHolder,
      bankbookFileId: bankbookEncryptedId || '',
      businessEmail: `${formData.email}@${formData.emailDomain}`,
      x: formData.x,
      y: formData.y,
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
          newErrors.businessNumber = '사업자등록번호는 10자리 숫자여야 합니다.';
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
        const businessLicenseInfo = await BusinessFileService.getFileInfo(
          businessLicenseEncryptedId
        );
        if (businessLicenseInfo.error || !businessLicenseInfo.data?.data) {
          throw new Error(
            '사업자등록증 파일을 찾을 수 없습니다. 다시 업로드해주세요.'
          );
        }
      }

      if (bankbookEncryptedId) {
        const bankbookInfo = await BusinessFileService.getFileInfo(
          bankbookEncryptedId
        );
        if (bankbookInfo.error || !bankbookInfo.data?.data) {
          throw new Error(
            '통장 사본 파일을 찾을 수 없습니다. 다시 업로드해주세요.'
          );
        }
      }

      // Ensure we have encryptedId for both files
      if (!businessLicenseEncryptedId) {
        throw new Error('사업자등록증 파일을 업로드해주세요.');
      }
      if (!bankbookEncryptedId) {
        throw new Error('통장 사본 파일을 업로드해주세요.');
      }

      const registrationData: BusinessRegistrationRequest = {
        businessRegistrationNumber:
          BusinessRegistrationService.normalizeBusinessRegistrationNumber(
            formData.businessNumber
          ),
        representativeName: formData.representativeName,
        businessName: formData.companyName,
        businessRegistrationCopyFileId: businessLicenseEncryptedId,
        roadAddress: formData.address,
        detailedAddress: formData.detailAddress,
        zipCode: formData.postalCode,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        depositorName: formData.accountHolder,
        bankbookFileId: bankbookEncryptedId,
        businessEmail: `${formData.email}@${formData.emailDomain}`,
        x: formData.x,
        y: formData.y,
      };

      console.log('Sending business registration request:', registrationData);

      // Check existing registration first for debugging
      const existingRegistration =
        await BusinessRegistrationService.getExistingBusinessRegistration();
      console.log('🔍 Existing registration check:', existingRegistration);

      const response =
        await BusinessRegistrationService.submitBusinessRegistration(
          registrationData
        );

      if (response.error) {
        console.error('Business registration failed:', response.error);

        // Handle 409 Conflict (already registered) - this should now be handled by the service
        if (
          response.error.includes('409') ||
          response.error.includes('이미 가게를 등록했습니다') ||
          response.error.includes('already exists') ||
          response.error.includes('duplicate')
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

        // Handle re-registration errors more gracefully
        if (
          response.error.includes('rejected') ||
          response.error.includes('반려')
        ) {
          console.log(
            'Previous registration was rejected, allowing re-registration...'
          );
          // Don't throw error, let the user try again
          setErrors({
            submit: '이전 등록이 반려되었습니다. 다시 시도해주세요.',
          });
          return;
        }

        throw new Error(response.error);
      }

      console.log('Business registration successful:', response.data);

      // Extract requestId from response to attach files
      let requestId: string | null = null;
      if (response.data?.data) {
        const businessData = response.data
          .data as unknown as BusinessRegistration;
        requestId = businessData.requestId || null;
      }

      // Attach files using fileId and requestId (entityId)
      if (requestId && businessLicenseFileId && bankbookFileId) {
        try {
          console.log('Attaching files to business registration:', {
            requestId,
            businessLicenseFileId,
            bankbookFileId,
          });

          const attachResponse = await BusinessFileService.attachFiles(
            requestId,
            [businessLicenseFileId, bankbookFileId]
          );

          if (attachResponse.error) {
            console.error('File attachment failed:', attachResponse.error);
            // Don't throw error - files are already uploaded and registration is successful
            // The files might already be attached or will be attached later
          } else {
            console.log('Files attached successfully:', attachResponse.data);
          }
        } catch (attachError) {
          console.error('File attachment error:', attachError);
          // Don't throw error - files are already uploaded and registration is successful
        }
      }

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
                        setEmailValidationStatus('idle');
                        setEmailValidationMessage('');
                      }}
                    >
                      {domain}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

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
                {!isVerified && (
                  <span className={styles.timer}>{formatTime(timeLeft)}</span>
                )}
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
            disabled={
              !canSubmit ||
              user?.businessApprovalStatus === 'PENDING' /* ||
              user?.businessApprovalStatus === 'REJECTED' */ ||
              false
            }
          >
            {isSubmitting
              ? '등록 제출 중...'
              : user?.businessApprovalStatus === 'PENDING'
              ? '승인 대기 중'
              : user?.businessApprovalStatus === null
              ? 'Join membership'
              : /*  : user?.businessApprovalStatus === 'REJECTED'
              ? '승인 거부됨' */
                '회원가입'}
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
        <p className={styles.successMessage}>
          사업자 등록이 완료되었습니다. 승인 후 이용하실 수 있어요.
        </p>
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
