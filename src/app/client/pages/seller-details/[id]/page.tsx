'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { StoreService } from '@/app/api/services/client/storeService/storeService';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberStoreService } from '@/app/api/services/client/memberService/memberStore/memberStoreService';
import defaultProfile from '@/app/constats/defaultProfile';
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
import toast, { Toaster } from 'react-hot-toast';
import { ContactDrawer } from '@/app/components/ui/drawer/ContactDrawer/ContactDrawer';

export default function SellerDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDrawer, setShowDrawer] = useState(false);

  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const lastSeg = pathname?.split('/').filter(Boolean).at(-1);
  const storeId = params?.id ?? lastSeg ?? '';

  const urlCategory = searchParams.get('categoryName') || '';

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [currentUserStoreId, setCurrentUserStoreId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory, selectedCategory]);

  useEffect(() => {
    const getCurrentUserStoreId = async () => {
      try {
        const response = await MemberService.getMyInfo();
        if (response.data?.data?.storeId) {
          setCurrentUserStoreId(response.data.data.storeId);
        }
      } catch (error) {
        console.error('Failed to get current user store ID:', error);
      }
    };
    getCurrentUserStoreId();
  }, []);

  useEffect(() => {
    setError(null);
    setStore(null);

    if (!storeId) {
      setError('잘못된 상점 경로입니다. (storeId 미확인)');
      return;
    }

    (async () => {
      try {
        let response;

        if (currentUserStoreId && currentUserStoreId === storeId) {
          response = await MemberStoreService.getMyStore();
        } else {
          response = await StoreService.getStoreSummary(storeId);
        }

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
  }, [storeId, currentUserStoreId]);

  const isOwner = useMemo(() => {
    if (!currentUserStoreId || !storeId) return false;
    return currentUserStoreId === storeId;
  }, [currentUserStoreId, storeId]);

  if (error) {
    return (
      <>
        <Toaster position="bottom-center" />
        <ProductHeader />
        <div className={styles.container}>
          <p style={{ padding: 16, color: 'crimson' }}>{error}</p>
        </div>
      </>
    );
  }

  if (!store) return <Loading />;

  const profileImage = store.businessProfileImage || defaultProfile.image;
  const phoneNumber = store.businessPhoneNumber || '전화번호 없음';

  const getBusinessHours = () => {
    if (!store.openingHours || !store.closingHours) {
      return '영업시간 정보 없음';
    }

    const open = store.openingHours;
    const close = store.closingHours;

    return `${open} - ${close}`;
  };

  const businessHours = getBusinessHours();

  const fullAddress = store.detailedAddress
    ? `${store.roadAddress} ${store.detailedAddress}`
    : store.roadAddress;

  const productCount = store.numberOfProducts ?? 0;
  const averageRating = store.averageRating ?? 0;

  const goToEditProfile = () => {
    router.push(`/client/seller/pages/change-profile?storeId=${storeId}`);
  };

  const handleCategoryChange = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryName === '') {
      params.delete('categoryName');
    } else {
      params.set('categoryName', categoryName);
    }
    params.delete('page');
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/client/pages/seller-details/${storeId}${newUrl}`);
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <ProductHeader />
      <div className={styles.container}>
        <div className={styles.profileDetails}>
          {isOwner ? (
            <button
              type="button"
              className={styles.editChip}
              onClick={goToEditProfile}
            >
              수정하기
            </button>
          ) : (
            <DotMenu storeId={storeId} storeName={store.businessName} />
          )}

          {profileImage && (
            <div className={styles.profileWrapper}>
              <img
                src={profileImage}
                alt={store.businessName}
                className={styles.profileImage}
              />
              <h1 className={styles.sellerName}>{store.businessName}</h1>
            </div>
          )}

          <div className={styles.sellerMoreDetails}>
            <div className={styles.details}>
              <IoCallOutline size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.phone}>{phoneNumber}</p>
              <button
                className={styles.callButton}
                onClick={() => {
                  if (phoneNumber === '전화번호 없음') {
                    toast.error('전화번호 정보가 없습니다.');
                    return;
                  }
                  setShowDrawer(true);
                }}
              >
                전화 연결
              </button>
            </div>

            <div className={styles.details}>
              <LuAlarmClock size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.workingHours}>{businessHours}</p>
            </div>

            <div className={styles.details}>
              <IoLocationOutline size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.location}>{fullAddress}</p>
            </div>

            {store.businessEmail && (
              <div className={styles.details}>
                <IoCallOutline size={18} color="rgba(0,0,0,0.8)" />
                <p className={styles.email}>{store.businessEmail}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.titleReview}>
          <p className={styles.review}>
            <span className={styles.reviewLabel}>등록된 상품</span>
            <span className={styles.reviewQuantity}>
              <BsBoxSeam size={16} color="#B5DB58" />
              {productCount} 개
            </span>
          </p>

          <div className={styles.separator}></div>

          <p className={styles.review}>
            <span className={styles.reviewLabel}>평점</span>
            <span className={styles.reviewQuantity}>
              <FaStar size={16} color="#FFC71F" />
              {averageRating > 0 ? averageRating.toFixed(1) : '평점 없음'}
            </span>
          </p>
        </div>

        <div className={styles.categoryWrapper}>
          <h2 className={styles.categoryLabel}>이 스토의 상품 보기</h2>
          <CategoryNav
            onSelectCategory={handleCategoryChange}
            currentCategory={selectedCategory}
          />
        </div>

        <ProductGrid
          categoryName={selectedCategory}
          storeId={storeId}
          onProductClick={(product) => {
            const productId = product.productId || product.id;
            if (productId) {
              router.push(`/client/pages/products/${productId}`);
            } else {
              console.error('Product missing ID:', product);
            }
          }}
          onAddToCart={() => {}}
        />
      </div>

      {showDrawer && storeId && (
        <ContactDrawer storeId={storeId} onClose={() => setShowDrawer(false)} />
      )}
    </>
  );
}
