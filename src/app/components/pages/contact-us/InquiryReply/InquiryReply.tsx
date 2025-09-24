'use client';

import { useEffect, useState } from 'react';
import styles from './InquiryReply.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { contactService } from '@/app/api/services/contact-service/contactService';
import type { ContactInquiry } from '@/app/api/types/contact/contact';
import { useRouter, usePathname } from 'next/navigation';

type InquiryReplyProps = {
  inquiryId: string;
};

export default function InquiryReply({ inquiryId }: InquiryReplyProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHistory = pathname?.includes('/history-inquiry');
  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const list = await contactService.getAllInquiries();
        const found =
          list.find((i) => String(i.id) === String(inquiryId)) || null;
        if (mounted) setInquiry(found);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [inquiryId]);

  if (loading) {
    return (
      <>
        <ProductHeader />
        <div className={styles.page}>
          <div className={styles.skelCard} />
          <div className={styles.skelCardTall} />
        </div>
      </>
    );
  }

  if (!inquiry) {
    return (
      <>
        <ProductHeader />
        <div className={styles.page}>
          <p className={styles.empty}>해당 문의를 찾을 수 없습니다.</p>
        </div>
      </>
    );
  }

  const dateShort = new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(inquiry.date));

  return (
    <>
      <ProductHeader />
      <div className={styles.topTabsBar}>
        <button
          className={`${styles.topTab} ${
            isHistory ? styles.topTabActive : styles.topTabInactive
          }`}
        >
          문의내역
        </button>
        <button
          className={`${styles.topTab} ${
            !isHistory ? styles.topTabActive : styles.topTabInactive
          }`}
          onClick={() =>
            router.push('/client/pages/my-page/history-inquiry/contact-seller')
          }
        >
          문의하기
        </button>
      </div>

      <div className={styles.page}>
        <section className={styles.block}>
          <p className={styles.meta}>
            <span className={styles.category}>
              {inquiry.category} | {dateShort}
            </span>
          </p>

          <div className={styles.card}>
            <div className={styles.cardInner}>
              <p className={styles.question}>{inquiry.message}</p>
            </div>
          </div>
        </section>

        <div className={styles.divider}> </div>

        <section className={styles.block}>
          <h2 className={styles.replyTitle}>답변드립니다.</h2>
          <div className={`${styles.card} ${styles.cardTall}`}>
            <div className={styles.cardInner}>
              <p className={styles.replyText}>{inquiry.responseMessage}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
