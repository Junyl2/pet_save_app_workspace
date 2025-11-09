'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import styles from './CustomerService.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { AdminInquiryService } from '@/app/api/services/admin/adminInquiryService/adminInquiryService';
import { AdminInquiryItem } from '@/app/api/services/admin/adminInquiryService/adminInquiry';

const PAGE_SIZE = 10;

export default function CustomerServicePage() {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);
  const [inquiries, setInquiries] = useState<AdminInquiryItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  /** Fetch inquiries */
  const fetchInquiries = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await AdminInquiryService.searchInquiries({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      });

      const data = response.data?.data;
      const content = data?.content ?? [];
      const total = data?.pageInfo?.totalPages ?? 1;

      setInquiries(content);
      setTotalPages(total);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchInquiries();
  }, [fetchInquiries]);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.headerRow}>
          <div className={styles.col}>번호</div>
          <div className={styles.col}>제목</div>
          <div className={styles.col}>작성일</div>
          <div className={styles.col}>상태</div>
        </div>

        {/* Content */}
        {inquiries.length === 0 ? (
          <div className={styles.empty}>문의 내역이 없습니다.</div>
        ) : (
          inquiries.map((item, index) => {
            const formattedDate = item.createdAt
              ? item.createdAt.slice(0, 10)
              : '-';

            const targetPath =
              item.status === 'ANSWERED'
                ? `/admin/pages/customer-service-center/customer-inquiry/answer-completed/${item.inquiryId}`
                : `/admin/pages/customer-service-center/customer-inquiry/waiting-reply/${item.inquiryId}`;

            return (
              <div
                key={item.inquiryId}
                className={clsx(styles.dataRow, {
                  [styles.rowAnswered]: item.status === 'ANSWERED',
                })}
                onClick={() => router.push(targetPath)}
              >
                <div className={styles.col}>
                  {(page - 1) * PAGE_SIZE + (index + 1)}
                </div>
                <div className={styles.col}>{item.category}</div>
                <div className={styles.col}>{formattedDate}</div>
                <div
                  className={clsx(styles.col, {
                    [styles.answered]: item.status === 'ANSWERED',
                    [styles.waiting]: item.status === 'WAITING',
                  })}
                >
                  {item.status === 'ANSWERED' ? '답변 완료' : '답변 대기'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}
        >
          <div style={{ width: 320 }}>
            <OrderPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </>
  );
}
