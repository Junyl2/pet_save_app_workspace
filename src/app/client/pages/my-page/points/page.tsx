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
import { orderDetailsService } from '@/app/api/services/client/memberService/order/oderDetailsService';
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

interface ReviewableProduct {
  orderItemId: string;
  productId: string;
  name: string;
  price: number;
  brand: string;
  image: string;
}

export default function PointsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((state: RootState) => state.points);

  const [currentPoints, setCurrentPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [reviewableProducts, setReviewableProducts] = useState<
    ReviewableProduct[]
  >([]);

  //  control how many products to show initially
  const [showAllReviewables, setShowAllReviewables] = useState(false);

  useEffect(() => {
    const loadPointsData = async () => {
      try {
        const statsResult = await dispatch(fetchPointsStats());
        if (fetchPointsStats.fulfilled.match(statsResult)) {
          const totalUsablePoints =
            statsResult.payload.data.data.data.totalUsablePoints;
          setCurrentPoints(totalUsablePoints || 0);
        }

        const historyResult = await dispatch(fetchPointsHistory({ size: 3 }));
        if (fetchPointsHistory.fulfilled.match(historyResult)) {
          const content = historyResult.payload.data.data.data?.content || [];
          const transformedHistory: PointTransaction[] = content.map(
            (transaction: any, index: number) => ({
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

        //  Fetch reviewable products
        const reviewableResult = await orderDetailsService.getMyOrderHistory({
          onlyReviewable: true,
        });
        if (reviewableResult.data?.data?.content) {
          const items = reviewableResult.data.data.content.map((item) => ({
            orderItemId: item.orderItemId,
            productId: item.productId,
            name: item.productName,
            price: item.price,
            brand: item.storeName,
            image: item.productImageUrl,
          }));
          setReviewableProducts(items);
        } else {
          setReviewableProducts([]);
        }
      } catch (error) {
        console.error('Failed to load points data:', error);
      }
    };

    loadPointsData();
  }, [dispatch]);

  if (loading) {
    return (
      <>
        <ProductHeader />
        <PointsSkeleton />
      </>
    );
  }

  // Show only first 5 products unless "show all" is true
  const visibleProducts = showAllReviewables
    ? reviewableProducts
    : reviewableProducts.slice(0, 5);

  return (
    <>
      <ProductHeader />

      <div className={styles.container}>
        {/* Current Points */}
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

          <button
            className={styles.pointsInfoButton}
            onClick={() => router.push(PAGE_URLS.POINTS_GUIDE)}
          >
            <span>포인트 이용안내</span>
            <FaChevronRight className={styles.chevronIcon} />
          </button>
        </div>

        <div className={styles.divider}></div>

        {/* Points History */}
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
          {pointHistory.map((transaction) => (
            <div key={transaction.id} className={styles.historyItem}>
              <div className={styles.historyLeft}>
                <div className={styles.historyDate}>{transaction.date}</div>
                <div className={styles.historyDescription}>
                  {transaction.description}
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

        {/* Reviewable Products */}
        <div className={styles.rewardsHeader}>
          <h3 className={styles.rewardsTitle}>리뷰 쓰고 포인트 받기</h3>
        </div>

        <div className={styles.rewardsSubHeader}>
          <span className={styles.rewardsSubTitle}>쓸 수 있는 리뷰</span>
          <span className={styles.rewardsCount}>
            {reviewableProducts.length}개
          </span>
          {/*  View All navigates to reviews page */}
          <button
            className={styles.viewAllButton}
            onClick={() => router.push('/client/pages/my-page/reviews')}
          >
            전체보기 <FaChevronRight className={styles.smallChevron} />
          </button>
        </div>

        <div className={styles.rewardsSection}>
          <div className={styles.productList}>
            {visibleProducts.map((product) => (
              <div key={product.orderItemId} className={styles.productItem}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productPrice}>
                    {product.price.toLocaleString()}원
                  </div>
                  <div className={styles.productBrand}>{product.brand}</div>
                </div>

                <button
                  className={styles.reviewButton}
                  onClick={() =>
                    router.push(
                      `/client/pages/my-page/reviews/write?productId=${product.productId}`
                    )
                  }
                >
                  리뷰쓰기
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
