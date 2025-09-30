'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { useUser } from '@/app/context/userContext';
import { BusinessService } from '@/app/api/services/client/businessService/businessService';
import { BusinessRegistration } from '@/app/api/types/business/business';
import SellerInformation from '@/app/components/auth/seller-form/SellerForm';
import styles from './page.module.css';

export default function SellerBusinessInformationPage() {
  const router = useRouter();
  const { user } = useUser();
  const [businessData, setBusinessData] = useState<BusinessRegistration | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Redirect if user is not approved seller
  useEffect(() => {
    if (user && user.role !== 'seller' && !user.storeId) {
      router.push('/client/seller/pages/my-page/business-information');
    }
  }, [user, router]);

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
          banner="승인된 사업자 정보"
          status="APPROVED"
        />
      </div>
      <BottomBar />
    </>
  );
}
