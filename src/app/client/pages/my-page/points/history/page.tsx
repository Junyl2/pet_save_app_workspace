'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { PointsService } from '@/app/api/services/client/memberService/points/pointsService';
import styles from './PointsHistory.module.css';

interface PointTransaction {
  id: number;
  date: string;
  type: 'earned' | 'used';
  description: string;
  amount: number;
  expiryDate?: string;
  status?: string;
  subtitle: string;
}

export default function PointsHistoryPage() {
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [expiringPoints, setExpiringPoints] = useState(0);

  useEffect(() => {
    const fetchPointsHistory = async () => {
      try {
        // Fetch points stats for current points and expiring points calculation
        const statsResponse = await PointsService.getPointsStats();
        if (statsResponse.data) {
          // For now, we'll calculate expiring points from history
          // In the future, this could be a separate API endpoint
        }

        const response = await PointsService.getPointsHistory({ size: 50 });

        if (
          response.data &&
          response.data.success &&
          response.data.data &&
          response.data.data.content
        ) {
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

          const expiringAmount = response.data.data.content
            .filter(
              (transaction) =>
                transaction.type === 'EARNED' &&
                new Date(transaction.expiryDate) <= sevenDaysFromNow
            )
            .reduce((sum, transaction) => sum + transaction.amount, 0);

          setExpiringPoints(expiringAmount);

          const transformedHistory: PointTransaction[] =
            response.data.data.content.map((transaction, index) => ({
              id: index + 1,
              date: new Date(transaction.createdAt)
                .toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
                .replace(/\./g, '.')
                .replace(/\s/g, ''),
              type: transaction.type === 'EARNED' ? 'earned' : 'used',
              description: transaction.title,
              amount:
                transaction.type === 'EARNED'
                  ? transaction.amount
                  : -transaction.amount,
              expiryDate:
                transaction.type === 'EARNED'
                  ? `${new Date(transaction.expiryDate)
                      .toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })
                      .replace(/\./g, '.')
                      .replace(/\s/g, '')} 소멸`
                  : undefined,
              status: transaction.type === 'USED' ? '사용 완료' : undefined,
              subtitle:
                transaction.product?.productName ||
                (transaction.type === 'USED' ? '포인트 사용' : '포인트 적립'),
            }));

          setPointHistory(transformedHistory);
        } else {
          setPointHistory([]);
          setExpiringPoints(0);
        }
      } catch (error) {
        console.error('Failed to fetch points history:', error);
        setPointHistory([]);
        setExpiringPoints(0);
      }
    };

    fetchPointsHistory();
  }, []);

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
          {pointHistory.length === 0 ? (
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
            pointHistory.map((transaction) => (
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
            ))
          )}
        </div>
      </div>
    </>
  );
}
