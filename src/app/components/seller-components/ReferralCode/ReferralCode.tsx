'use client';

import React, { useState, useEffect } from 'react';
import styles from './ReferralCode.module.css';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import Image from 'next/image';

interface ReferralCodeData {
  sellerId: string;
  points: number;
  qrCodeUrl: string;
}

export default function ReferralCode() {
  const [referralData, setReferralData] = useState<ReferralCodeData>({
    sellerId: 'SELLER1',
    points: 1000,
    qrCodeUrl: '/images/qr-placeholder.png',
  });

  // Load referral data (mock implementation)
  useEffect(() => {
    // In a real app, this would fetch from an API
    const mockData: ReferralCodeData = {
      sellerId: 'SELLER1',
      points: 1000,
      qrCodeUrl: '/images/qr-placeholder.png',
    };
    setReferralData(mockData);
  }, []);

  const handleDownloadQR = () => {
    // In a real app, this would download the QR code image
    console.log('Downloading QR code...');
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.page}>
        {/* Title */}
        <h1 className={styles.title}>추천인 코드관리</h1>

        {/* QR Code */}
        <div className={styles.qrCodeContainer}>
          <Image
            src="/images/qr/qr.png"
            alt="QR Code"
            width={100}
            height={100}
            className={styles.qrCode}
          />
        </div>

        {/* Seller Info */}
        <div className={styles.sellerInfo}>
          <div className={styles.sellerId}>
            판매자 ID : {referralData.sellerId}
          </div>
          <div className={styles.points}>
            보유포인트 : {referralData.points.toLocaleString()}
          </div>
        </div>

        {/* Download Button */}
        <div className={styles.downloadSection}>
          <button className={styles.downloadBtn} onClick={handleDownloadQR}>
            QR 코드 다운로드
          </button>
          <div className={styles.offlineText}>(오프라인용)</div>
        </div>
      </div>
    </>
  );
}
