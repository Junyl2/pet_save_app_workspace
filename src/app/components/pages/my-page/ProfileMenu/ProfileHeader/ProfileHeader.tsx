'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProfileHeader.module.css';
import Image from 'next/image';
import { PAGE_URLS } from '@/app/utils/page_url';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberInfo } from '@/app/api/types/member/member';
import { useUser } from '@/app/context/userContext';

const ProfileHeader = () => {
  const router = useRouter();
  const { user } = useUser();
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actions = [
    {
      label: '주문 내역',
      route: PAGE_URLS.ORDER_HISTORY,

      icon: '/images/icons/mypage-note.svg',
    },
    {
      label: '리뷰',
      route: PAGE_URLS.REVIEWS,
      icon: '/images/icons/mypage-take-note.svg',
    },
    {
      label: '찜한 상품',
      route: PAGE_URLS.STEAMED_PRODUCTS,
      icon: '/images/icons/mypage-heart.svg',
    },
    {
      label: '포인트',
      route: PAGE_URLS.MYPAGE_POINTS,
      icon: '/images/icons/mypage-star.svg',
    },
  ];
  // Fetch member information on component mount
  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 Fetching member info for ProfileHeader...');

        // Get member info directly from MemberService
        const response = await MemberService.getMyInfo();

        if (response.error) {
          console.error('❌ Failed to fetch member info:', response.error);
          setError('회원 정보를 불러오는데 실패했습니다.');
          return;
        }

        console.log('✅ Member info fetched successfully:', response.data);
        setMemberInfo(response.data?.data || null);
      } catch (err) {
        console.error('💥 Error refreshing user data:', err);
        setError('회원 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberInfo();
  }, []); // Empty dependency array - only run once on mount

  const sources = [
    'https://i.pravatar.cc/100?img=1', // random avatar
    'https://i.pravatar.cc/100?img=2',
  ];
  const randomSrc = sources[Math.floor(Math.random() * sources.length)];

  return (
    <div className={styles.profileHeader}>
      {/* Top row */}
      <div className={styles.topRow}>
        <div className={styles.profileImage}>
          <Image
            src={randomSrc}
            alt="Profile"
            width={100}
            height={100}
            className={styles.profileImage}
          />
        </div>
        <div className={styles.profileInfo}>
          {isLoading ? (
            <span className={styles.username}>로딩 중...</span>
          ) : error ? (
            <span className={styles.username}>펫세이브</span>
          ) : (
            <div>
              <span className={styles.username}>
                {memberInfo?.name ||
                  memberInfo?.nickname ||
                  memberInfo?.username ||
                  user?.username ||
                  '펫세이브'}
              </span>
              {user?.role === 'seller' && (
                <span className={styles.roleBadge}>판매자</span>
              )}
            </div>
          )}
        </div>
        <button className={styles.editButton}>수정하기</button>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        {actions.map((action) => (
          <div
            key={action.label}
            className={styles.quickActionItem}
            onClick={() => router.push(action.route)}
          >
            <Image
              src={action.icon}
              alt={action.label}
              className={styles.actionIcon}
              height={28}
              width={28}
            />
            <span>{action.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
