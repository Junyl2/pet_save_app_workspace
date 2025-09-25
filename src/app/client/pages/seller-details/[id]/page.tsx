'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { StoreService } from '@/app/api/services/client/storeService/storeService';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { StoreInfo } from '@/app/api/types/member/store/store';
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

export default function SellerDetailsPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentUserStoreId, setCurrentUserStoreId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Get storeId from route or fallback to last segment
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const lastSeg = pathname?.split('/').filter(Boolean).at(-1);
  const storeId = params?.id ?? lastSeg ?? '';

  // Get current user's store ID
  useEffect(() => {
    const getCurrentUserStoreId = async () => {
      try {
        const response = await MemberService.getMyInfo();
        console.log('Current user info:', response.data?.data);
        if (response.data?.data?.storeId) {
          console.log('Current user store ID:', response.data.data.storeId);
          setCurrentUserStoreId(response.data.data.storeId);
        } else {
          console.log('No store ID found for current user');
        }
      } catch (error) {
        console.error('Failed to get current user store ID:', error);
      }
    };
    getCurrentUserStoreId();
  }, []);

  // Fetch store details
  useEffect(() => {
    setError(null);
    setStore(null);
    if (!storeId) {
      setError('잘못된 상점 경로입니다. (storeId 미확인)');
      return;
    }
    (async () => {
      try {
        const response = await StoreService.getStoreSummary(storeId);
        if (response.error) {
          setError(response.error);
          return;
        }
        if (response.data?.data) {
          setStore(response.data.data);
        } else {
          setError('상점 정보를 찾을 수 없습니다.');
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : '상점 정보를 불러오는 중 오류가 발생했습니다.';
        setError(message);
      }
    })();
  }, [storeId]);

  // Decide ownership by comparing current user's storeId with URL storeId
  const isOwner = useMemo(() => {
    console.log('Ownership check:', {
      currentUserStoreId,
      urlStoreId: storeId,
      isOwner: currentUserStoreId === storeId,
    });
    if (!currentUserStoreId || !storeId) return false;
    return currentUserStoreId === storeId;
  }, [currentUserStoreId, storeId]);

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

  if (!store) return <Loading />;

  const profileImage = '/images/default-shop.png'; // Default image since StoreInfo doesn't have image field
  const categories: string[] = []; // Categories will be handled by ProductGrid component

  const goToEditProfile = () => {
    router.push(`/client/seller/pages/change-profile?storeId=${storeId}`);
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
                alt={store.businessName}
                className={styles.profileImage}
                height={70}
                width={70}
              />
              <h1 className={styles.sellerName}>{store.businessName}</h1>
            </div>
          )}

          <div className={styles.sellerMoreDetails}>
            <div className={styles.details}>
              <IoCallOutline size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.phone}>{store.businessEmail}</p>
              <button
                className={styles.callButton}
                onClick={() => alert(`Contacting ${store.businessEmail}`)}
              >
                연락하기
              </button>
            </div>
            <div className={styles.details}>
              <LuAlarmClock size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.workingHours}>09:00 - 18:00</p>
            </div>
            <div className={styles.details}>
              <IoLocationOutline size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.location}>{store.roadAddress}</p>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.titleReview}>
          <p className={styles.review}>
            <span className={styles.reviewLabel}>등록된 상품</span>
            <span className={styles.reviewQuantity}>
              <BsBoxSeam size={16} color="#B5DB58" />0 개
            </span>
          </p>
          <div className={styles.separator}></div>
          <p className={styles.review}>
            <span className={styles.reviewLabel}>리뷰</span>
            <span className={styles.reviewQuantity}>
              <FaStar size={16} color="#FFC71F" />0
            </span>
          </p>
        </div>

        <div className={styles.categoryWrapper}>
          <h2 className={styles.categoryLabel}>이 스토의 상품 보기</h2>
          <CategoryNav onSelectCategory={setSelectedCategory} />
        </div>

        <ProductGrid
          category={selectedCategory}
          storeId={storeId}
          onProductClick={(product) => router.push(`/products/${product.id}`)}
        />
      </div>
    </>
  );
}
