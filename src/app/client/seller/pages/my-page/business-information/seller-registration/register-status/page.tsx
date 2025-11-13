'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import SellerInformation from '@/app/components/auth/seller-form/SellerForm';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';
import { useUser } from '@/app/context/userContext';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { fetchUserInfo } from '@/app/redux/slices/cache/userSlice';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import styles from './page.module.css';

const STATUS_RULES: Record<string, { readOnly: boolean; banner: string }> = {
  작성중: { readOnly: false, banner: '필수 항목을 입력해 주세요.' },
  '승인 대기': { readOnly: true, banner: '사업자 등록 심사중' },
  '관리자 승인 완료': { readOnly: true, banner: '관리자 승인 완료됨' },
  '등록 완료': { readOnly: true, banner: '등록이 완료되었습니다' },
  반려: { readOnly: false, banner: '반려되었습니다. 수정 후 재제출하세요.' },
};

export default function RegisterStatusPage() {
  const router = useRouter();
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);
  const storeId = userInfo?.storeId || user?.storeId;

  const [businessData, setBusinessData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualStatus, setActualStatus] = useState<string>('작성중');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  // Fetch business registration data from API
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching business registration data from API...');

        const response =
          await BusinessRegistrationService.getExistingBusinessRegistration();

        if (response.error) {
          console.error('❌ Error fetching business data:', response.error);
          // If no registration exists, status is "작성중"
          setActualStatus('작성중');
          setBusinessData(null);
          return;
        }

        // Check if response has data
        // API response structure: { success: boolean, status: number, resultMsg: string, data: {...} }
        if (response.data?.success && response.data.data) {
          const data = response.data.data as Record<string, unknown>;
          console.log('✅ Business data fetched from API:', data);
          console.log(
            '📋 Business registration copy URL:',
            data.businessRegistrationCopy
          );
          console.log('📋 Bankbook URL:', data.bankbook);
          setBusinessData(data);

          // Get actual status from API
          // API statuses: PENDING, APPROVED, REJECTED
          const apiStatus = (data.status as string)?.toUpperCase();

          // Determine Korean status based on API status and storeId
          let koreanStatus = '작성중';

          if (apiStatus === 'PENDING') {
            koreanStatus = '승인 대기';
          } else if (apiStatus === 'APPROVED') {
            // If approved and has storeId, it's fully registered
            // Otherwise, it's admin approved but not yet fully registered
            if (storeId) {
              koreanStatus = '등록 완료';
            } else {
              koreanStatus = '관리자 승인 완료';
            }
          } else if (apiStatus === 'REJECTED') {
            koreanStatus = '반려';
          } else {
            // If status is missing or unknown, default to "작성중"
            console.warn('⚠️ Unknown API status:', apiStatus);
            koreanStatus = '작성중';
          }

          console.log('📊 API Status:', apiStatus);
          console.log('📊 Korean Status:', koreanStatus);
          console.log('📊 StoreId:', storeId);
          setActualStatus(koreanStatus);

          // Show rejection modal if status is REJECTED
          if (apiStatus === 'REJECTED') {
            setTimeout(() => {
              setShowRejectionModal(true);
            }, 200);
          }
        } else {
          // No registration data exists, status is "작성중"
          console.log('📊 No business registration data found');
          setActualStatus('작성중');
          setBusinessData(null);
        }
      } catch (error) {
        console.error('❌ Error fetching business data:', error);
        setActualStatus('작성중');
        setBusinessData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessData();
  }, [userInfo, user, storeId]);

  // Helper function to extract filename from URL
  const getFileNameFromUrl = (
    url: string | undefined,
    defaultName: string
  ): string => {
    if (!url) return defaultName;
    try {
      // Extract filename from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // If it's a file ID (long string), show a generic name
      if (fileName.length > 20 || !fileName.includes('.')) {
        return defaultName;
      }
      return fileName;
    } catch {
      return defaultName;
    }
  };

  // Prepare form data from API response
  const formData = useMemo(() => {
    if (!businessData) {
      // Return empty form data if no business data exists (for "작성중" status)
      return {
        businessNumber: '',
        representativeName: '',
        companyName: '',
        postalCode: '',
        address: '',
        detailAddress: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        email: '',
        emailDomain: '',
        businessLicenseLabel: '',
        bankbookLabel: '',
      };
    }

    // Extract data from API response (data is Record<string, unknown>)
    // API returns full URLs for files, so we use them directly
    const businessEmail = businessData.businessEmail as string;
    const emailParts = businessEmail ? businessEmail.split('@') : ['', ''];
    const businessLicenseUrl = businessData.businessRegistrationCopy as
      | string
      | undefined;
    const bankbookUrl = businessData.bankbook as string | undefined;

    return {
      businessNumber: (businessData.businessRegistrationNumber as string) || '',
      representativeName: (businessData.representativeName as string) || '',
      companyName: (businessData.businessName as string) || '',
      postalCode: (businessData.zipCode as string) || '',
      address: (businessData.roadAddress as string) || '',
      detailAddress: (businessData.detailedAddress as string) || '',
      bankName: (businessData.bankName as string) || '',
      accountNumber: (businessData.accountNumber as string) || '',
      accountHolder: (businessData.depositorName as string) || '',
      email: emailParts[0] || '',
      emailDomain: emailParts[1] || '',
      businessLicenseLabel: getFileNameFromUrl(
        businessLicenseUrl,
        '사업자등록증'
      ),
      bankbookLabel: getFileNameFromUrl(bankbookUrl, '통장사본'),
      // Use file URLs directly from API response (already full URLs)
      businessLicenseUrl: businessLicenseUrl,
      bankbookUrl: bankbookUrl,
    };
  }, [businessData]);

  // Get status rule based on actual status from API
  const rule = useMemo(
    () => STATUS_RULES[actualStatus] ?? STATUS_RULES['작성중'],
    [actualStatus]
  );

  if (isLoading) {
    return (
      <>
        <ProductHeader />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>사업자 정보를 불러오는 중...</div>
        </div>
        <BottomBar />
      </>
    );
  }

  if (error && actualStatus !== '작성중') {
    return (
      <>
        <ProductHeader />
        <div className={styles.errorContainer}>
          <div className={styles.errorText}>
            {error || '사업자 정보를 찾을 수 없습니다.'}
          </div>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
        <BottomBar />
      </>
    );
  }

  // Get rejection reason from business data
  const rejectionReason = businessData?.rejectionReason as string | undefined;

  const handleRejectionModalConfirm = () => {
    setShowRejectionModal(false);
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <SellerInformation
          initial={formData}
          readOnly={rule.readOnly}
          banner={rule.banner}
          status={actualStatus}
          disableEmailValidation={true}
          onDone={() => router.push('/client/pages/homepage')}
        />
      </div>
      <BottomBar />

      {/* Rejection Modal - Show when status is REJECTED */}
      {actualStatus === '반려' && (
        <BaseModal
          open={showRejectionModal}
          onClose={handleRejectionModalConfirm}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <Image
                src="/images/icons/reject.svg"
                alt="Rejected"
                width={50}
                height={50}
              />
            </div>
            <p className={styles.modalTitle}>사업자 인증 반려</p>
            <div className={styles.modalText}>
              <p className={styles.modalMessageLabel}>
                사업자 인증 반려 이유들
              </p>
              {rejectionReason && (
                <p className={styles.modalMessage}>{rejectionReason}</p>
              )}
            </div>
            <button
              className={styles.modalButton}
              onClick={handleRejectionModalConfirm}
            >
              확인
            </button>
          </div>
        </BaseModal>
      )}
    </>
  );
}
