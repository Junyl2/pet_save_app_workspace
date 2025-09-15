'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Seller } from '@/app/api/types/seller/seller';
import { sellerService } from '@/app/api/services/seller/serller-details/sellerService';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { ProductGrid } from '@/app/components/sections/ProductGrid/ProductGrid';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import styles from './Seller.module.css';
import { DotMenu } from '@/app/components/ui/DotMenu/DotMenu';
import { IoLocationOutline, IoCallOutline } from 'react-icons/io5';
import { LuAlarmClock } from 'react-icons/lu';
import { FaStar } from 'react-icons/fa6';
import { BsBoxSeam } from 'react-icons/bs';
import Loading from '@/app/components/ui/Loading/Loading';
import Image from 'next/image';

function getNumericField(obj: unknown, key: string): number | null {
  if (!obj || typeof obj !== 'object') return null;
  const value = (obj as Record<string, unknown>)[key];
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number(value)
      : NaN;
  return Number.isFinite(n) ? (n as number) : null;
}

export default function SellerDetailsPage() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [storedSellerId, setStoredSellerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Get shopId from route or fallback to last segment
  const params = useParams<{ shopId?: string }>();
  const pathname = usePathname();
  const lastSeg = pathname?.split('/').filter(Boolean).at(-1);
  const rawId = params?.shopId ?? lastSeg ?? '';
  const shopId = Number(rawId);

  // Read sellerId from localStorage (set during seller login)
  useEffect(() => {
    const v =
      typeof window !== 'undefined'
        ? Number(window.localStorage.getItem('sellerId'))
        : NaN;
    setStoredSellerId(Number.isFinite(v) ? v : null);
  }, []);

  // Fetch seller details
  useEffect(() => {
    setError(null);
    setSeller(null);
    if (!Number.isFinite(shopId)) {
      setError('잘못된 상점 경로입니다. (shopId 미확인)');
      return;
    }
    (async () => {
      try {
        const data = await sellerService.getSellerDetailsByShopId(shopId);
        setSeller(data);
        const firstCategory = data.products?.[0]?.category || '';
        setSelectedCategory(firstCategory);
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : '판매자 정보를 불러오는 중 오류가 발생했습니다.';
        setError(message);
      }
    })();
  }, [shopId]);

  // Decide ownership purely from stored sellerId vs ownerId/route id
  const isOwner = useMemo(() => {
    if (!seller || !Number.isFinite(shopId)) return false;
    const ownerId =
      getNumericField(seller, 'ownerId') ??
      getNumericField(seller, 'sellerId') ??
      shopId;
    return storedSellerId != null && storedSellerId === ownerId;
  }, [seller, shopId, storedSellerId]);

  if (error) {
    return (
      <>
        <ProductHeader />
        <div className={styles.container}>
          <p style={{ padding: 16, color: 'crimson' }}>{error}</p>
        </div>
      </>
    );
  }

  if (!seller) return <Loading />;

  const profileImage =
    seller.products?.[0]?.shopImage || '/images/default-shop.png';
  const categories = Array.from(
    new Set((seller.products || []).map((p) => p.category))
  );

  const goToEditProfile = () => {
    router.push(`/client/seller/pages/change-profile?shopId=${shopId}`);
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <div className={styles.profileDetails}>
          {isOwner ? (
            <button
              type="button"
              className={styles.editChip}
              onClick={goToEditProfile}
              aria-label="프로필 수정하기"
            >
              수정하기
            </button>
          ) : (
            <DotMenu />
          )}

          {profileImage && (
            <div className={styles.profileWrapper}>
              <Image
                src={profileImage}
                alt={seller.name}
                className={styles.profileImage}
                height={70}
                width={70}
              />
              <h1 className={styles.sellerName}>{seller.name}</h1>
            </div>
          )}

          <div className={styles.sellerMoreDetails}>
            <div className={styles.details}>
              <IoCallOutline size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.phone}>{seller.phoneNumber}</p>
              <button
                className={styles.callButton}
                onClick={() => alert(`Calling ${seller.phoneNumber}`)}
              >
                전화 연결
              </button>
            </div>
            <div className={styles.details}>
              <LuAlarmClock size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.workingHours}>{seller.workingHours}</p>
            </div>
            <div className={styles.details}>
              <IoLocationOutline size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.location}>{seller.location}</p>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.titleReview}>
          <p className={styles.review}>
            <span className={styles.reviewLabel}>등록된 상품</span>
            <span className={styles.reviewQuantity}>
              <BsBoxSeam size={16} color="#B5DB58" />
              {seller.reviewCount} 개
            </span>
          </p>
          <div className={styles.separator}></div>
          <p className={styles.review}>
            <span className={styles.reviewLabel}>리뷰</span>
            <span className={styles.reviewQuantity}>
              <FaStar size={16} color="#FFC71F" />
              {seller.rating}
            </span>
          </p>
        </div>

        <div className={styles.categoryWrapper}>
          <h2 className={styles.categoryLabel}>이 스토의 상품 보기</h2>
          <CategoryNav
            categories={categories}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <ProductGrid
          category={selectedCategory}
          onProductClick={(product) => router.push(`/products/${product.id}`)}
        />
      </div>
    </>
  );
}
