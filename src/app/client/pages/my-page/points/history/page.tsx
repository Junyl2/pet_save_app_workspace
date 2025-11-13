'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { PointsService } from '@/app/api/services/client/memberService/points/pointsService';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import ClientPagination from '@/app/components/admin/ui/ClientPagination/ClientPagination';
import styles from './PointsHistory.module.css';

interface PointTransaction {
  id: string; // generated locally for React key
  date: string;
  type: 'earned' | 'used';
  description: string;
  amount: number;
  expiryDate?: string;
  status?: string;
  subtitle: string;
}

const PAGE_SIZE = 10;

export default function PointsHistoryPage() {
  const { page, setPage } = usePageParam(1);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [expiringPoints, setExpiringPoints] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  /** Fetch paginated points history */
  useEffect(() => {
    const fetchPointsHistory = async () => {
      try {
        setLoading(true);

        const response = await PointsService.getPointsHistory({
          page: page - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
        });

        if (
          response.data &&
          response.data.success &&
          response.data.data &&
          response.data.data.content
        ) {
          const { content, pageInfo } = response.data.data;

          // 7일 이내 소멸 예정 포인트 계산
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

          const expiringAmount = content
            .filter(
              (transaction) =>
                transaction.type === 'EARNED' &&
                new Date(transaction.expiryDate) <= sevenDaysFromNow
            )
            .reduce((sum, t) => sum + t.amount, 0);

          setExpiringPoints(expiringAmount);
          setTotalPages(pageInfo?.totalPages ?? 1);

          const transformed: PointTransaction[] = content.map((t, i) => ({
            id: `${page}-${i}`, // ✅ safe unique key per page
            date: new Date(t.createdAt)
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\./g, '.')
              .replace(/\s/g, ''),
            type: t.type === 'EARNED' ? 'earned' : 'used',
            description: t.title,
            amount: t.type === 'EARNED' ? t.amount : -t.amount,
            expiryDate:
              t.type === 'EARNED'
                ? `${new Date(t.expiryDate)
                    .toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                    .replace(/\./g, '.')
                    .replace(/\s/g, '')} 소멸`
                : undefined,
            status: t.type === 'USED' ? '사용 완료' : undefined,
            subtitle:
              t.product?.productName ||
              (t.type === 'USED' ? '포인트 사용' : '포인트 적립'),
          }));

          setPointHistory(transformed);
        } else {
          setPointHistory([]);
          setExpiringPoints(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch points history:', error);
        setPointHistory([]);
        setExpiringPoints(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsHistory();
  }, [page]);

  return (
    <>
      <ProductHeader />

      <div className={styles.container}>
        {/* Expiring Points Info */}
        <div className={styles.filterSection}>
          <span className={styles.filterLabel}>7일 이내 소멸 예정</span>
          <span className={styles.filterValue}>
            {expiringPoints.toLocaleString()}원
          </span>
        </div>
        <div className={styles.divider}></div>

        {/* History Section */}
        <div className={styles.historySection}>
          {loading ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>불러오는 중...</p>
            </div>
          ) : pointHistory.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Image
                src="/images/products/noresult.png"
                alt="No points history"
                width={100}
                height={100}
                className={styles.emptyImage}
              />
              <p className={styles.emptyText}>포인트 내역이 없습니다.</p>
            </div>
          ) : (
            <>
              {pointHistory.map((transaction) => (
                <div key={transaction.id} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <div className={styles.historyDate}>{transaction.date}</div>
                    <div className={styles.historyDescription}>
                      {transaction.description}
                    </div>
                    <div className={styles.historySubtitle}>
                      {transaction.subtitle}
                    </div>
                  </div>
                  <div className={styles.historyRight}>
                    <div
                      className={`${styles.historyAmount} ${
                        transaction.type === 'used'
                          ? styles.negative
                          : styles.positive
                      }`}
                    >
                      {transaction.type === 'used' ? '- ' : '+ '}
                      {Math.abs(transaction.amount).toLocaleString()}원
                    </div>
                    <div className={styles.expiryDate}>
                      {transaction.type === 'earned'
                        ? transaction.expiryDate
                        : transaction.status}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <div style={{ width: 320 }}>
                    <ClientPagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
