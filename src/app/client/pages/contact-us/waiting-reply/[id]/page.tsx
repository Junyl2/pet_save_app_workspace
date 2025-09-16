'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ContactInquiry } from '@/app/api/types/contact/contact';
import { contactService } from '@/app/api/services/contact-service/contactService';
import styles from './DeleteInquiry.module.css';
import { DotMenu } from '@/app/components/ui/DotMenu/DotMenu';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function DeleteInquiryPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchInquiry = async () => {
      setLoading(true);
      const data = await contactService.getInquiryById(id);
      setInquiry(data);
      setLoading(false);
    };
    fetchInquiry();
  }, [id]);

  const handleDelete = async () => {
    if (!inquiry) return;
    await contactService.deleteInquiry(inquiry.id);

    toast.success(`문의가 삭제되었습니다`, {
      style: {
        background: '#f87171',
      },
      iconTheme: {
        primary: '#f87171',
        secondary: '#fff',
      },
    });

    router.push('/contact-us');
  };

  const formatKoreanDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  if (loading) return <p>Loading...</p>;
  if (!inquiry) return <p>Inquiry not found</p>;

  return (
    <>
      <ProductHeader />

      <div className={styles.container}>
        {/* User profile */}
        <div className={styles.userProfile}>
          <Image
            src="/images/shops/clinic1.png"
            alt="User Profile"
            className={styles.profileImage}
            width={40}
            height={40}
          />
          <span className={styles.userName}>펫세이브</span>
        </div>

        <p className={styles.header}>
          <span className={styles.inquiryCat}>{inquiry.category}</span> |
          <span className={styles.shopName}> [{inquiry.shopName}] </span> |{' '}
          <span className={styles.date}>{formatKoreanDate(inquiry.date)}</span>
        </p>

        <div className={styles.messageBox}>
          <DotMenu mode="deletePage" onDelete={handleDelete} />
          <div className={styles.messageContent}>
            <p>{inquiry.message}</p>
          </div>
        </div>

        <div className={styles.divider}> </div>

        {inquiry.status === '답변 완료' && (
          <div className={styles.responseBox}>
            <h2 className={styles.responseLabel}>답변드립니다.</h2>
            <div className={styles.messageContent}>
              <p>
                문의 주셔서 감사합니다. [{inquiry.shopName}]에 대한 질문에 대해
                아래와 같이 답변 드리겠습니다.
              </p>

              <p>{inquiry.responseMessage}</p>
            </div>
          </div>
        )}

        {inquiry.status === '답변 대기 중' && (
          <div className={styles.responseBox}>
            <h2 className={styles.responseLabel}>답변 대기 중</h2>
            <div className={styles.messageContent}>
              <p>
                문의 주셔서 감사합니다. [{inquiry.shopName}]에 대한 질문에 대해
                답변이 준비되는 대로 연락드리겠습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
