'use client';
import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader/ProfileHeader';
import ProfileSection from './ProfileSection/ProfileSection';
import ProfileItem from './ProfileItem/ProfileItem';
import styles from './ProfileMenu.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { useUser } from '@/app/context/userContext';
import { PAGE_URLS } from '@/app/utils/page_url';
import LogoutModal from '@/app/components/ui/modal/LogoutModal/LogoutModal';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchUserInfo } from '@/app/redux/slices/cache/userSlice';

const ProfileMenu = (): React.ReactElement => {
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Redux state
  const { userInfo } = useAppSelector((state) => state.user);
  const role = userInfo?.role || user?.role;
  const businessApproved =
    userInfo?.businessApprovalStatus || user?.businessApprovalStatus;
  const storeId = userInfo?.storeId || user?.storeId;

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  return (
    <>
      <ProductHeader />
      <div className={styles.profileMenu}>
        <ProfileHeader />

        {/* Customer Service */}
        <ProfileSection title="고객센터">
          <ProfileItem
            label="문의내역"
            route="/client/pages/my-page/history-inquiry"
          />

          {/* Business Registration / Info */}
          {role === 'seller' || businessApproved ? (
            <ProfileItem
              label="사업자 정보 보기"
              route={PAGE_URLS.BUSINESS_INFORMATION}
            />
          ) : (
            <ProfileItem
              label="사업자등록"
              route={PAGE_URLS.SELLER_REGISTRATION}
            />
          )}

          {/* Store Info (for sellers with a storeId) */}
          {role === 'seller' && !!storeId && (
            <ProfileItem
              label="사업장 정보"
              route={`${PAGE_URLS.SELLER_STORE_INFO}?storeId=${storeId}`}
            />
          )}

          <ProfileItem
            label="약관 및 정책"
            route={PAGE_URLS.TERMS_CONDITIONS}
          />
        </ProfileSection>

        {/* Settings */}
        <ProfileSection title="설정">
          <ProfileItem
            label="회원 정보 수정"
            route={PAGE_URLS.MEMBER_INFORMATION}
          />
          <ProfileItem
            label="알림 설정"
            route={PAGE_URLS.NOTIFICATION_SETTINGS}
          />
          <ProfileItem
            label="배송지 관리"
            route={PAGE_URLS.DELIVERY_ADDRESS_MANAGEMENT}
          />
          <ProfileItem label="차단 리스트" route="/my-page/block-list" />
        </ProfileSection>

        {/* Etc */}
        <ProfileSection title="기타">
          <ProfileItem
            label="공지사항"
            route={PAGE_URLS.NOTICE_PAGE}
            showChevron={false}
          />

          {/* Show referral code only for sellers */}
          {role === 'seller' && (
            <ProfileItem
              label="내 추천인 코드"
              route={PAGE_URLS.MY_REFFERAL_CODE}
              showChevron={false}
            />
          )}

          <ProfileItem
            label="로그아웃"
            onClick={() => setShowLogoutModal(true)}
            showChevron={false}
          />
          <ProfileItem
            label="탈퇴하기"
            route={PAGE_URLS.MYPAGE_WITHDRAWAL}
            showChevron={false}
          />
        </ProfileSection>
      </div>

      <BottomBar />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default ProfileMenu;
