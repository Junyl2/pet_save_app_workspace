'use client';

import { useEffect, useState, useMemo } from 'react';
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
import Image from 'next/image';

export default function SellerDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get storeId from route or fallback to last segment
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const lastSeg = pathname?.split('/').filter(Boolean).at(-1);
  const storeId = params?.id ?? lastSeg ?? '';

  // Get current page and category from URL parameters
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const urlCategory = searchParams.get('categoryName') || '';

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [currentUserStoreId, setCurrentUserStoreId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Sync URL category with state
  useEffect(() => {
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory, selectedCategory]);

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
        let response;

        // If viewing own store, use MemberStoreService for detailed info
        if (currentUserStoreId && currentUserStoreId === storeId) {
          console.log('Fetching own store details using MemberStoreService...');
          response = await MemberStoreService.getMyStore();
        } else {
          // For other stores, use StoreService
          console.log('Fetching store details using StoreService...');
          response = await StoreService.getStoreSummary(storeId);
        }

        if (response.error) {
          setError(response.error);
          return;
        }
        if (response.data?.data) {
          setStore(response.data.data);
          console.log('Store details loaded:', response.data.data);
          console.log(
            'Store profile image:',
            response.data.data.businessProfileImage
          );
          console.log('Store phone:', response.data.data.businessPhoneNumber);
          console.log(
            'Store hours:',
            response.data.data.openingHours,
            '-',
            response.data.data.closingHours
          );
          console.log('Product count:', response.data.data.numberOfProducts);
          console.log('Average rating:', response.data.data.averageRating);
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

  // Use real store data from API
  const profileImage = store.businessProfileImage || defaultProfile.image;
  const phoneNumber = store.businessPhoneNumber || '전화번호 없음';
  // Display business hours - API field names are swapped
  const getBusinessHours = () => {
    if (!store.openingHours || !store.closingHours) {
      return '영업시간 정보 없음';
    }

    // API returns: openingHours = closing time, closingHours = opening time
    // So we need to use them in the correct order for display
    const openingTime = store.closingHours; // This is the actual opening time
    const closingTime = store.openingHours; // This is the actual closing time

    return `${openingTime} - ${closingTime}`;
  };

  const businessHours = getBusinessHours();

  // Debug: Log the actual values to see what's happening
  console.log('Business hours debug:', {
    rawOpeningHours: store.openingHours,
    rawClosingHours: store.closingHours,
    actualOpening: store.closingHours,
    actualClosing: store.openingHours,
    businessHours: businessHours,
  });
  const fullAddress = store.detailedAddress
    ? `${store.roadAddress} ${store.detailedAddress}`
    : store.roadAddress;
  const productCount = store.numberOfProducts ?? 0;
  const averageRating = store.averageRating ?? 0;

  const goToEditProfile = () => {
    router.push(`/client/seller/pages/change-profile?storeId=${storeId}`);
  };

  // Handle page change by updating URL
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 0) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/client/pages/seller-details/${storeId}${newUrl}`);
  };

  // Handle category change by updating URL
  const handleCategoryChange = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryName === '') {
      params.delete('categoryName');
    } else {
      params.set('categoryName', categoryName);
    }
    // Reset to page 0 when changing category
    params.delete('page');
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/client/pages/seller-details/${storeId}${newUrl}`);
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
            <DotMenu storeId={storeId} storeName={store.businessName} />
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
              <p className={styles.phone}>{phoneNumber}</p>
              <button
                className={styles.callButton}
                onClick={() => {
                  if (phoneNumber !== '전화번호 없음') {
                    alert(`연락처: ${phoneNumber}`);
                  } else {
                    alert('전화번호 정보가 없습니다.');
                  }
                }}
              >
                연락하기
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
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onProductClick={(product) => {
            const productId = product.productId || product.id;
            if (productId) {
              router.push(`/client/pages/products/${productId}`);
            } else {
              console.error('Product missing ID:', product);
            }
          }}
      </div>
    </>
  );
}
