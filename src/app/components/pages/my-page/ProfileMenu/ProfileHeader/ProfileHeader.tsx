'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProfileHeader.module.css';
import Image from 'next/image';
import { PAGE_URLS } from '@/app/utils/page_url';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import {
  fetchUserInfo,
  revalidateUserInfoInBackground,
  checkStaleStatus,
} from '@/app/redux/slices/cache/userSlice';
import { DiVim } from 'react-icons/di';

const ProfileHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state
  const { userInfo, loading, error, isStale } = useAppSelector(
    (state) => state.user
  );

  // Fetch user info using Redux with smart caching
  useEffect(() => {
    console.log('Dispatching fetchUserInfo');
    dispatch(fetchUserInfo());
  }, [dispatch]);

  // Background revalidation effect
  useEffect(() => {
    if (userInfo && isStale) {
      console.log(
        '🔄 User info is stale, triggering background revalidation...'
      );
      dispatch(revalidateUserInfoInBackground());
    }
  }, [dispatch, userInfo, isStale]);

  // Check stale status when component mounts or data changes
  useEffect(() => {
    dispatch(checkStaleStatus());
  }, [dispatch, userInfo]);

  const profileImageUrl =
    userInfo?.profileImageUrl || '/images/icons/profile-default.png';

  // Show loading state only on first visit when no user info
  if (loading && !userInfo) {
    return (
      <div className={styles.profileHeader}>
        <div className={styles.topRow}>
          <div className={styles.profileImage}>
            <div className={styles.loadingSkeleton} />
          </div>
          <div className={styles.profileInfo}>
            <div
              className={styles.loadingSkeleton}
              style={{ width: '120px', height: '20px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.profileHeader}>
        <div className={styles.topRow}>
          <div className={styles.profileImage}>
            <Image
              src="/images/icons/profile-default.png"
              alt="Profile"
              fill
              className={styles.profile}
            />
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.errorText}>
              사용자 정보를 불러올 수 없습니다.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const actions = [
    {
      label: '주문 내역',
      route: PAGE_URLS.ORDER_HISTORY,
      icon: '/images/icons/mypage-note.svg',
      border: (
        <>
          <div className={styles.divider} />
        </>
      ),
    },
    {
      label: '리뷰',
      route: PAGE_URLS.REVIEWS,
      icon: '/images/icons/mypage-take-note.svg',
      border: (
        <>
          <div className={styles.divider} />
        </>
      ),
    },
    {
      label: '찜한 상품',
      route: PAGE_URLS.STEAMED_PRODUCTS,
      icon: '/images/icons/mypage-heart.svg',
      border: (
        <>
          <div className={styles.divider} />
        </>
      ),
    },
    {
      label: '포인트',
      route: PAGE_URLS.MYPAGE_POINTS,
      icon: '/images/icons/mypage-star.svg',
    },
  ];

  return (
    <div className={styles.profileHeader}>
      {/* Top row */}
      <div className={styles.topRow}>
        <div className={styles.profileImage}>
          <Image
            src={profileImageUrl}
            alt="Profile"
            width={55}
            height={55}
            className={styles.profileImage}
          />
        </div>
        <div className={styles.profileInfo}>
          <div>
            <span className={styles.username}>{userInfo?.name || '...'}</span>
            {userInfo?.role === 'seller' && (
              <span className={styles.roleBadge}>판매자</span>
            )}
            {userInfo?.businessApprovalStatus === 'PENDING' && (
              <span className={styles.pendingBadge}>승인 대기 중</span>
            )}
            {userInfo?.businessApprovalStatus === 'REJECTED' && (
              <span className={styles.rejectedBadge}>승인 거부</span>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push(PAGE_URLS.MEMBER_INFORMATION)}
          className={styles.editButton}
        >
          수정하기
        </button>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        {actions.map((action) => (
          <>
            <div
              key={action.label}
              className={styles.quickActionItem}
              onClick={() => router.push(action.route)}
            >
              <Image
                src={action.icon}
                alt={action.label}
                className={styles.actionIcon}
                height={25}
                width={25}
              />
              <span className={styles.actionLabel}>{action.label}</span>
            </div>
            <div>{action.border}</div>
          </>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
