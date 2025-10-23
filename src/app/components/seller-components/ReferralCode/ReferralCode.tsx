'use client';

import React, { useState, useEffect } from 'react';
import styles from './ReferralCode.module.css';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import Image from 'next/image';
import { QRService } from '@/app/api/services/client/memberService/qrService';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { useRouter } from 'next/navigation';

interface ReferralCodeData {
  referralCode: string;
  points: number;
  qrCodeUrl: string;
  memberName: string;
}

export default function ReferralCode() {
  const router = useRouter();
  const [referralData, setReferralData] = useState<ReferralCodeData>({
    referralCode: '',
    points: 0,
    qrCodeUrl: '/images/qr/qr.png',
    memberName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load member data and QR code from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First, get member information
        const memberResponse = await MemberService.getMyInfo();

        if (memberResponse.error) {
          setError(memberResponse.error);
          console.error('Failed to load member info:', memberResponse.error);

          // If it's an authentication error, redirect to login
          if (
            memberResponse.error.includes('401') ||
            memberResponse.error.includes('403')
          ) {
            router.push('/client/login');
            return;
          }
        } else if (memberResponse.data?.data) {
          const memberData = memberResponse.data.data;

          // Update referral data with real member information
          setReferralData((prev) => ({
            ...prev,
            referralCode: memberData.referralCode || 'N/A',
            points: memberData.availablePointsBalance || 0,
            memberName: memberData.name || memberData.username || 'User',
          }));

          // Then, get QR code (only if user has referral code)
          if (memberData.referralCode && memberData.referralCode !== 'N/A') {
            const qrResponse = await QRService.getReferralQRCode();

            if (qrResponse.error) {
              console.error('Failed to load QR code:', qrResponse.error);
              // If QR code generation fails, show a message but don't block the page
              if (
                qrResponse.error.includes('403') ||
                qrResponse.error.includes('Forbidden')
              ) {
                console.log(
                  'QR code generation not available for this account type'
                );
              }
            } else if (qrResponse.data) {
              setReferralData((prev) => ({
                ...prev,
                qrCodeUrl: qrResponse.data!,
              }));
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleDownloadQR = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await QRService.downloadReferralQRCode(
        'my-referral-qr-code.jpg'
      );

      if (response.error) {
        setError(response.error);
        console.error('Failed to download QR code:', response.error);
      } else {
        console.log('QR code downloaded successfully');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to download QR code';
      setError(errorMessage);
      console.error('Error downloading QR code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.page}>
        {/* Title */}
        <h1 className={styles.title}>추천인 코드관리</h1>

        {/* Error Message */}
        {error && <div className={styles.errorMessage}>오류: {error}</div>}

        {/* QR Code */}
        <div className={styles.qrCodeContainer}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>QR 코드 생성 중...</p>
            </div>
          ) : referralData.referralCode === 'N/A' ? (
            <div className={styles.noQrCode}>
              <p>추천인 코드가 없습니다</p>
              <p className={styles.noQrSubtext}>QR 코드를 생성할 수 없습니다</p>
            </div>
          ) : (
            <Image
              src={referralData.qrCodeUrl}
              alt="Referral QR Code"
              width={100}
              height={100}
              className={styles.qrCode}
            />
          )}
        </div>

        {/* Member Info */}
        <div className={styles.sellerInfo}>
          <div className={styles.sellerId}>
            추천인 코드 :{' '}
            {referralData.referralCode === 'N/A'
              ? '없음'
              : referralData.referralCode}
          </div>
          <div className={styles.points}>
            보유포인트 : {referralData.points.toLocaleString()}
          </div>
        </div>

        {/* Download Button */}
        <div className={styles.downloadSection}>
          <button
            className={styles.downloadBtn}
            onClick={handleDownloadQR}
            disabled={
              isLoading || !!error || referralData.referralCode === 'N/A'
            }
          >
            {isLoading ? '다운로드 중...' : 'QR 코드 다운로드'}
          </button>
          <div className={styles.offlineText}>(오프라인용)</div>
        </div>
      </div>
    </>
  );
}
