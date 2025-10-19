'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { PAGE_URLS } from '@/app/utils/page_url';
import {
  fetchPointsStats,
  fetchPointsHistory,
} from '@/app/redux/slices/cache/pointsSlice';
import { RootState, AppDispatch } from '@/app/redux/store';
import PointsSkeleton from '@/app/components/ui/SkeletonLoading/PointsSkeleton/PointsSkeleton';
import styles from './Points.module.css';

interface PointTransaction {
  id: number;
  date: string;
  type: 'earned' | 'used';
  description: string;
  amount: number;
  expiryDate?: string;
  status?: string;
}

interface RewardProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  brand: string;
  image: string;
}

export default function PointsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { statsCache, historyCache, loading, error } = useSelector(
    (state: RootState) => state.points
  );

  // Local state for UI
  const [currentPoints, setCurrentPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);

  useEffect(() => {
    const loadPointsData = async () => {
      try {
        // Fetch points stats
        const statsResult = await dispatch(fetchPointsStats());

        if (fetchPointsStats.fulfilled.match(statsResult)) {
          console.log('Points stats result:', statsResult.payload);
          const totalUsablePoints =
            statsResult.payload.data.data.data.totalUsablePoints;
          console.log('Total usable points:', totalUsablePoints);
          setCurrentPoints(totalUsablePoints || 0);
        }

        // Fetch points history
        const historyResult = await dispatch(fetchPointsHistory({ size: 3 }));

        if (fetchPointsHistory.fulfilled.match(historyResult)) {
          const content = historyResult.payload.data.data.data?.content || [];

          // Transform API data to match existing UI structure
          const transformedHistory: PointTransaction[] = content.map(
            (transaction, index) => ({
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
            })
          );

          setPointHistory(transformedHistory);
        }
      } catch (error) {
        console.error('Failed to load points data:', error);
      }
    };

    loadPointsData();
  }, [dispatch]);

  const rewardProducts: RewardProduct[] = [
    {
      id: 1,
      name: '로얄캐닌 강아지 사료 1kg',
      price: 11000,
      brand: '○○ 동물병원',
      image: '/images/products/dogfood.png',
    },
    {
      id: 2,
      name: '하림펫푸드 더리얼 동결건조 닭가슴살',
      price: 12560,
      brand: '펫프렌즈',
      image: '/images/products/dog-snack.png',
    },
    {
      id: 3,
      name: '하림펫푸드 더리얼 동결건조 닭가슴살',
      price: 12560,
      brand: '펫프렌즈',
      image: '/images/products/dog-snack2.png',
    },
  ];

  if (loading) {
    return (
      <>
        <ProductHeader />
        <PointsSkeleton />
      </>
    );
  }

  return (
    <>
      <ProductHeader />

      <div className={styles.container}>
        {/* Current Points Section */}
        <div className={styles.pointsSection}>
          <h2 className={styles.sectionTitle}>현재 포인트</h2>
          <div className={styles.currentPoints}>
            <div className={styles.pointIconWrap}>
              <Image
                src="/images/icons/p_icon.png"
                alt="Points"
                width={56}
                height={56}
                className={styles.pointIconImage}
                priority
              />
            </div>
            <span className={styles.pointAmount}>
              {(currentPoints || 0).toLocaleString()}원
            </span>
          </div>

          {/* Points Usage Info */}
          <button
            className={styles.pointsInfoButton}
            onClick={() => router.push(PAGE_URLS.POINTS_GUIDE)}
          >
            <span>포인트 이용안내</span>
            <FaChevronRight className={styles.chevronIcon} />
          </button>
        </div>
        <div className={styles.divider}></div>

        {/* Points History Section */}
        <div className={styles.historyHeader}>
          <h3 className={styles.historyTitle}>포인트 내역</h3>
          <button
            className={styles.viewAllButton}
            onClick={() => router.push(PAGE_URLS.POINTS_HISTORY)}
          >
            전체보기 <FaChevronRight className={styles.smallChevron} />
          </button>
        </div>

        <div className={styles.historySection}>
          {pointHistory?.map((transaction) => (
            <div key={transaction.id} className={styles.historyItem}>
              <div className={styles.historyLeft}>
                <div className={styles.historyDate}>{transaction.date}</div>
                <div className={styles.historyDescription}>
                  {transaction.description}
                </div>
                <div className={styles.historySubtitle}>
                  {transaction.id === 1
                    ? '로얄캐닌 강아지 사료 1kg'
                    : transaction.id === 2
                    ? 'ANF 유기농 6Free 연어 강아지 사료'
                    : '배송비 결제'}
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
        </div>
        <div className={styles.divider}></div>

        {/* Rewards Section */}
        <div className={styles.rewardsHeader}>
          <h3 className={styles.rewardsTitle}>리뷰 쓰고 포인트 받기</h3>
        </div>

        <div className={styles.rewardsSubHeader}>
          <span className={styles.rewardsSubTitle}>쓸 수 있는 리뷰</span>
          <span className={styles.rewardsCount}>7개</span>
          <button className={styles.viewAllButton}>
            전체보기 <FaChevronRight className={styles.smallChevron} />
          </button>
        </div>

        <div className={styles.rewardsSection}>
          <div className={styles.productList}>
            {rewardProducts.map((product) => (
              <div key={product.id} className={styles.productItem}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={60}
                  height={60}
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productPrice}>
                    {product.price.toLocaleString()}원
                  </div>
                  <div className={styles.productBrand}>{product.brand}</div>
                </div>
                <button className={styles.reviewButton}>리뷰쓰기</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
