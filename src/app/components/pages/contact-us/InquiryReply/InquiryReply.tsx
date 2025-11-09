'use client';

import { useEffect, useState } from 'react';
import styles from './InquiryReply.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import type { ContactInquiry } from '@/app/api/types/contact/contact';
import { MemberInquiryService } from '@/app/api/services/client/memberService/inquiry-details/memberInquiryService';
import { MyInquiry } from '@/app/api/types/member/inquiry-details/inquiry';
import { DotMenu } from '@/app/components/ui/DotMenu/DotMenu';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import Loading from '@/app/components/ui/Loading/Loading';

type InquiryReplyProps = {
  inquiryId: string;
};

export default function InquiryReply({ inquiryId }: InquiryReplyProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHistory = pathname?.includes('/history-inquiry');
  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);

  const isMypage = pathname?.includes('/my-page/history-inquiry/reply');

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        // Fetch my inquiries and find by real inquiryId (UUID)
        const res = await MemberInquiryService.getMyInquiries({
          sortBy: 'createdAt',
          direction: 'desc',
          size: 100,
        });
        if (res.data && !res.error) {
          const foundApi: MyInquiry | undefined = res.data.data.content.find(
            (i) => i.inquiryId === inquiryId
          );
          const transformed: ContactInquiry | null = foundApi
            ? {
                id: foundApi.inquiryId,
                inquiryId: foundApi.inquiryId,
                date: foundApi.createdAt,
                shopName: foundApi.store.name,
                shopLocation: foundApi.store.address,
                shopImage:
                  foundApi.store.profileUrl || '/images/shops/shop1.png',
                category: foundApi.category,
                message: foundApi.content,
                responseMessage: foundApi.answer || '',
                status:
                  foundApi.status === 'ANSWERED' ? '답변 완료' : '답변 대기 중',
                productId: foundApi.product.productId,
              }
            : null;
          if (mounted) setInquiry(transformed);
        } else {
          if (mounted) setInquiry(null);
        }
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
        {/*       <ProductHeader />
        <div className={styles.page}>
          <div className={styles.skelCard} />
          <div className={styles.skelCardTall} />
        </div> */}
        <Loading />
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

  const handleDelete = async () => {
    if (!inquiry?.inquiryId) return;
    const res = await MemberInquiryService.deleteInquiry(inquiry.inquiryId);
    if (!res.error) {
      toast.success('문의가 삭제되었습니다.');
      router.push('/contact-us');
    } else {
      toast.error('삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const dateShort = new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(inquiry.date));

  return (
    <>
      <ProductHeader />
      {isMypage && (
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
              router.push(
                '/client/pages/my-page/history-inquiry/contact-seller'
              )
            }
          >
            문의하기
          </button>
        </div>
      )}

      <div className={styles.page}>
        <section className={styles.block}>
          <p className={styles.meta}>
            <span className={styles.category}>
              {inquiry.category} | {dateShort}
            </span>
          </p>

          {/* top-right menu for delete */}

          <div className={styles.messageBox}>
            <DotMenu mode="deletePage" onDelete={handleDelete} />
            <div className={styles.messageContent}>
              <p>{inquiry.message}</p>
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
