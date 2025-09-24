'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './ReplyInquiry.module.css';
import { mockContactInquiries } from '../../data/mockContact';
import { ContactInquiry } from '@/app/api/types/contact/contact';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import { useUser } from '@/app/context/userContext';

// Helper function to format date from YYYY-MM-DD to YY.MM.DD
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export default function ReplyInquiry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is approved seller
  useEffect(() => {
    if (
      user?.role !== 'seller' ||
      user?.businessApprovalStatus !== 'APPROVED'
    ) {
      router.push('/client/pages/homepage');
      return;
    }
  }, [user, router]);

  // Get inquiry data from URL params
  useEffect(() => {
    const inquiryId = searchParams.get('id');
    if (inquiryId) {
      const foundInquiry = mockContactInquiries.find(
        (inq) => inq.id === parseInt(inquiryId)
      );
      if (foundInquiry) {
        setInquiry(foundInquiry);
      } else {
        router.push('/client/seller/pages/seller-inquiry-details');
      }
    } else {
      router.push('/client/seller/pages/seller-inquiry-details');
    }
  }, [searchParams, router]);

  const handleSubmit = async () => {
    if (!replyText.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically make an API call to submit the reply
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the inquiry status in mock data (in real app, this would be handled by API)
      /*   const updatedInquiries = mockContactInquiries.map((inq) =>
        inq.id === inquiry?.id
          ? { ...inq, responseMessage: replyText, status: '답변 완료' as const }
          : inq
      ); */

      // In a real app, you would update the backend here
      console.log('Reply submitted:', {
        inquiryId: inquiry?.id,
        reply: replyText,
      });

      alert('답변이 성공적으로 등록되었습니다.');
      router.push('/client/seller/pages/seller-inquiry-details');
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('답변 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'seller') {
    return null; // Will redirect in useEffect
  }

  if (!inquiry) {
    return (
      <div className={styles.loading}>
        <div>문의 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <>
      <ProductHeader />
      <div className={styles.page}>
        {/* Inquiry Details Section */}
        <div className={styles.inquirySection}>
          <div className={styles.inquiryHeader}>
            <div className={styles.userInfo}>
              <div className={styles.userProfile}>
                <Image
                  src="/images/logo/pet-saves.png"
                  alt="펫세이브"
                  width={30}
                  height={30}
                  className={styles.profileImage}
                />
                <span className={styles.userName}>펫세이브</span>
              </div>
              <div className={styles.inquiryMeta}>
                {inquiry.category} | [{inquiry.shopName}] |{' '}
                {formatDate(inquiry.date)}
              </div>
            </div>
          </div>

          <div className={styles.inquiryContent}>
            <div className={styles.messageBox}>
              <div className={styles.messageText}>{inquiry.message}</div>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Reply Section */}
        <div className={styles.replySection}>
          <div className={styles.replyHeader}>
            <h2 className={styles.replyTitle}>답변하기</h2>
          </div>

          <div className={styles.replyContent}>
            <div className={styles.replyBox}>
              <textarea
                className={styles.replyTextarea}
                placeholder="답변을 입력해 주세요"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={8}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <button
            className={`${styles.submitButton} ${
              !replyText.trim() ? styles.disabled : ''
            }`}
            onClick={handleSubmit}
            disabled={!replyText.trim() || isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </>
  );
}
