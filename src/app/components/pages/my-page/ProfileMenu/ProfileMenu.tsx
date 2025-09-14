'use client';

import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader/ProfileHeader';
import ProfileSection from './ProfileSection/ProfileSection';
import ProfileItem from './ProfileItem/ProfileItem';
import styles from './ProfileMenu.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { PAGE_URLS } from '@/app/utils/page_url';
import LogoutModal from '@/app/components/ui/modal/LogoutModal/LogoutModal';

const ProfileMenu = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <ProductHeader />
      <div className={styles.profileMenu}>
        <ProfileHeader />

        {/* Customer Service */}
        <ProfileSection title="고객센터">
          <ProfileItem label="문의내역" route="/my-page/inquiries" />
          <ProfileItem label="사업자등록" route="/my-page/business" />
          <ProfileItem
            label="약관 및 정책"
            route={PAGE_URLS.TERMS_AND_CONDITIONS}
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
          <ProfileItem label="차단 리스트" route="/my-page/block-list" />
        </ProfileSection>

        {/* Etc */}
        <ProfileSection title="기타">
          <ProfileItem
            label="공지사항"
            route={PAGE_URLS.NOTICE_PAGE}
            showChevron={false}
          />
          <ProfileItem
            label="내 추천인 코드"
            route="/mypage/referral"
            showChevron={false}
          />
          <ProfileItem
            label="로그아웃"
            onClick={() => setShowLogoutModal(true)} // open modal
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
