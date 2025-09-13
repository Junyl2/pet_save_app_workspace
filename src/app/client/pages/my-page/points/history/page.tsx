'use client';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
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
  const pointHistory: PointTransaction[] = [
    {
      id: 1,
      date: '2025.07.30',
      type: 'earned',
      description: '구매확정',
      amount: 100,
      expiryDate: '2026.07.30 소멸',
      subtitle: '로얄캐닌 강아지 사료 1kg'
    },
    {
      id: 2,
      date: '2025.07.22',
      type: 'earned',
      description: '리뷰작성',
      amount: 50,
      expiryDate: '2026.07.22 소멸',
      subtitle: 'ANF 유기농 6Free 연어 강아지 사료'
    },
    {
      id: 3,
      date: '2025.07.15',
      type: 'used',
      description: '포인트 사용',
      amount: -2500,
      status: '사용 완료',
      subtitle: '배송비 결제'
    },
    // Duplicate entries to show more history
    {
      id: 4,
      date: '2025.07.30',
      type: 'earned',
      description: '구매확정',
      amount: 100,
      expiryDate: '2026.07.30 소멸',
      subtitle: '로얄캐닌 강아지 사료 1kg'
    },
    {
      id: 5,
      date: '2025.07.22',
      type: 'earned',
      description: '리뷰작성',
      amount: 50,
      expiryDate: '2026.07.22 소멸',
      subtitle: 'ANF 유기농 6Free 연어 강아지 사료'
    },
    {
      id: 6,
      date: '2025.07.15',
      type: 'used',
      description: '포인트 사용',
      amount: -2500,
      status: '사용 완료',
      subtitle: '배송비 결제'
    },
    {
      id: 7,
      date: '2025.07.30',
      type: 'earned',
      description: '구매확정',
      amount: 100,
      expiryDate: '2026.07.30 소멸',
      subtitle: '로얄캐닌 강아지 사료 1kg'
    },
    {
      id: 8,
      date: '2025.07.22',
      type: 'earned',
      description: '리뷰작성',
      amount: 50,
      expiryDate: '2026.07.22 소멸',
      subtitle: 'ANF 유기농 6Free 연어 강아지 사료'
    },
    {
      id: 9,
      date: '2025.07.15',
      type: 'used',
      description: '포인트 사용',
      amount: -2500,
      status: '사용 완료',
      subtitle: '배송비 결제'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <ProductHeader />

      {/* Period Filter */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>7일 이내 소멸 예정</span>
        <span className={styles.filterValue}>0원</span>
      </div>
      <div className={styles.divider}></div>

      {/* History List */}
      <div className={styles.historySection}>
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
              <div className={`${styles.historyAmount} ${transaction.type === 'used' ? styles.negative : styles.positive}`}>
                {transaction.type === 'used' ? '- ' : '+ '}{Math.abs(transaction.amount).toLocaleString()}원
              </div>
              <div className={styles.expiryDate}>
                {transaction.type === 'earned' ? transaction.expiryDate : transaction.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 