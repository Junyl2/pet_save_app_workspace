'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { useUser } from '@/app/context/userContext';
import { BusinessService } from '@/app/api/services/client/businessService/businessService';
import { BusinessRegistration } from '@/app/api/types/business/business';
import SellerInformation from '@/app/components/auth/seller-form/SellerForm';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import styles from './page.module.css';

export default function BusinessInfoFormPage() {
  const router = useRouter();
  const { user } = useUser();
  const [businessData, setBusinessData] = useState<BusinessRegistration | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Fetch business registration data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching business registration data...');

        const response = await BusinessService.getMyBusinessRegistration();

        if (response.error) {
          console.error('❌ Error fetching business data:', response.error);
          setError('사업자 정보를 불러오는데 실패했습니다.');
          return;
        }

        if (response.data?.success && response.data.data) {
          const data = response.data.data;
          console.log('✅ Business data fetched:', data);
          setBusinessData(data);
        } else {
          setError('사업자 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('❌ Error fetching business data:', error);
        setError('사업자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  // Redirect if user has storeId
  useEffect(() => {
    if (user && user.storeId) {
      router.push(
        '/client/seller/pages/my-page/business-information/seller-business-information'
      );
    }
  }, [user, router]);

  // Show rejection modal with delay for rejected users
  useEffect(() => {
    console.log(
      '🔍 Business Info Form - User status:',
      user?.businessApprovalStatus
    );
    console.log(
      '🔍 Business Info Form - Business data loaded:',
      !!businessData
    );
    console.log('🔍 Business Info Form - Is loading:', isLoading);

    if (
      user?.businessApprovalStatus === 'REJECTED' &&
      businessData &&
      !isLoading
    ) {
      console.log('🚨 Showing rejection modal for REJECTED user');
      const timer = setTimeout(() => {
        setShowRejectionModal(true);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      console.log('✅ Not showing rejection modal - conditions not met');
    }
  }, [user, businessData, isLoading]);

  const handleRejectionModalConfirm = () => {
    setShowRejectionModal(false);
    router.push('/client/seller/pages/registration');
  };

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

  if (error || !businessData) {
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

  // Helper function to extract filename from URL
  const getFileNameFromUrl = (url: string, defaultName: string): string => {
    if (!url) return '파일 없음';
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // If it's a file ID (long string), show a generic name
      if (fileName.length > 20) {
        return defaultName;
      }
      return fileName;
    } catch {
      return defaultName;
    }
  };

  // Prepare form data for display
  const formData = {
    businessNumber: businessData.businessRegistrationNumber || '',
    representativeName: businessData.representativeName || '',
    companyName: businessData.businessName || '',
    postalCode: businessData.zipCode || '',
    address: businessData.roadAddress || '',
    detailAddress: businessData.detailedAddress || '',
    bankName: businessData.bankName || '',
    accountNumber: businessData.accountNumber || '',
    accountHolder: businessData.depositorName || '',
    email: businessData.businessEmail?.split('@')[0] || '',
    emailDomain: businessData.businessEmail?.split('@')[1] || '',
    // Add file display names
    businessLicenseLabel: getFileNameFromUrl(
      businessData.businessRegistrationCopy,
      '사업자등록증'
    ),
    bankbookLabel: getFileNameFromUrl(businessData.bankbook, '통장사본'),
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <SellerInformation
          initial={formData}
          readOnly={true}
          banner={(() => {
            const banner =
              user?.businessApprovalStatus === 'REJECTED'
                ? '사업자등록 [반려]'
                : '사업자 등록 심사중';
            console.log(
              '🎯 Banner set to:',
              banner,
              'for status:',
              user?.businessApprovalStatus
            );
            return banner;
          })()}
          status={businessData.status}
        />
      </div>
      <BottomBar />

      {/* Rejection Modal - Only show for REJECTED users */}
      {user?.businessApprovalStatus === 'REJECTED' && (
        <BaseModal
          open={showRejectionModal}
          onClose={handleRejectionModalConfirm}
          title="사업자등록 반려"
        >
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <div className={styles.rejectIcon}>✕</div>
            </div>
            <div className={styles.modalText}>
              <p className={styles.modalMessage}>
                사업자등록이 반려되었습니다.
                <br />
                다시 신청해주세요.
              </p>
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
