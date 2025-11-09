'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import styles from './CustomerService.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { AdminNoticeService } from '@/app/api/services/admin/adminNoticeService/adminNoticeService';
import { NoticeItem } from '@/app/api/services/admin/adminNoticeService/adminNotice';

const PAGE_SIZE = 10;

export default function NoticePage() {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  /** Fetch notices */
  const fetchNotices = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await AdminNoticeService.searchNotices({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      });

      const data = response.data?.data;
      const content = data?.content ?? [];
      const total = data?.pageInfo?.totalPages ?? 1;

      setNotices(content);
      setTotalPages(total);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  return (
    <>
      <div className={styles.wrapper}>
        {/* Table Header */}
        <div className={styles.headerRow}>
          <div className={styles.col}>번호</div>
          <div className={styles.col}>제목</div>
          <div className={styles.col}>작성일</div>
          <div className={styles.col}>조회수</div>
        </div>

        {/* Table Content */}
        {notices.length === 0 ? (
          <div className={styles.empty}>등록된 공지사항이 없습니다.</div>
        ) : (
          notices.map((item, index) => {
            const formattedDate = item.createdAt
              ? item.createdAt.slice(0, 10)
              : '-';

            return (
              <div
                key={item.noticeId}
                className={clsx(styles.dataRow)}
                onClick={() =>
                  router.push(
                    `/admin/pages/customer-service-center/announcement/notices/${item.noticeId}`
                  )
                }
              >
                <div className={styles.col}>
                  {(page - 1) * PAGE_SIZE + (index + 1)}
                </div>
                <div className={styles.col}>{item.title}</div>
                <div className={styles.col}>{formattedDate}</div>
                <div className={styles.col}>0</div>
              </div>
            );
          })
        )}

        {/* 글 쓰기 Button */}
        <div className={styles.buttonWrap}>
          <button
            type="button"
            className={styles.writeButton}
            onClick={() =>
              router.push(
                '/admin/pages/customer-service-center/announcement/write'
              )
            }
          >
            글 쓰기
          </button>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.paginationWrap}>
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
