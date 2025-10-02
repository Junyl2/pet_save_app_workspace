'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProfileHeader.module.css';
import Image from 'next/image';
import { PAGE_URLS } from '@/app/utils/page_url';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberInfo } from '@/app/api/types/member/member';
import { useUser } from '@/app/context/userContext';
import { FileService } from '@/app/api/services/client/fileService/fileService';

const ProfileHeader = () => {
  const router = useRouter();
  const { user } = useUser();
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Log user context data for debugging
  useEffect(() => {
    console.log('👤 ProfileHeader - User Context Data:');
    console.log('  - User:', user);
    console.log('  - Role:', user?.role);
    console.log('  - Business Approval Status:', user?.businessApprovalStatus);
    console.log('  - Username:', user?.username);
  }, [user]);

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

        // Log business approval status from API
        if (response.data?.data) {
          const memberData = response.data.data;
          console.log('📋 ProfileHeader - Business Status from API:');
          console.log(
            '  - Business Approval Status:',
            memberData.businessApprovalStatus
          );
          console.log('  - Role:', memberData.role);
          console.log('  - Store ID:', memberData.storeId);
        }

        setMemberInfo(response.data?.data || null);

        // Load profile image if available
        if (response.data?.data?.profileFileId) {
          try {
            const imageResponse = await FileService.getFile(
              response.data.data.profileFileId,
              {
                disposition: 'inline',
                type: 'original',
              }
            );

            if (imageResponse.data) {
              const imageUrl = URL.createObjectURL(imageResponse.data);
              setProfileImage(imageUrl);
            }
          } catch (imageError) {
            console.error('Error loading profile image:', imageError);
          }
        }
      } catch (err) {
        console.error('💥 Error refreshing user data:', err);
        setError('회원 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberInfo();
  }, []); // Empty dependency array - only run once on mount

  // Default no-profile-picture placeholder
  const defaultProfileSrc = '/images/icons/profile-default.png';

  return (
    <div className={styles.profileHeader}>
      {/* Top row */}
      <div className={styles.topRow}>
        <div className={styles.profileImage}>
          <Image
            src={profileImage || defaultProfileSrc}
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
              {user?.businessApprovalStatus === 'PENDING' && (
                <span className={styles.pendingBadge}>승인 대기 중</span>
              )}
              {user?.businessApprovalStatus === 'REJECTED' && (
                <span className={styles.rejectedBadge}>승인 거부</span>
              )}
            </div>
          )}
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
