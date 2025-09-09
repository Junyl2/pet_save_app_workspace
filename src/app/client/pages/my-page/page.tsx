'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';
import LogoutModal from '@/app/components/ui/modal/LogoutModal/LogoutModal';
import styles from './styles.module.css';

export default function MyPage() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleMemberInfoClick = () => {
    router.push('/client/pages/my-page/member-information');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
        >
          <FaChevronLeft className={styles.backIcon} />
        </button>
        <h1 className={styles.headerTitle}>마이페이지</h1>
      </div>

      {/* Profile Section */}
      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          <Image
            src="/images/animals/강아지.png"
            alt="프로필"
            width={80}
            height={80}
            className={styles.avatar}
          />
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.userName}>펫세이브</h2>
          <p className={styles.userEmail}>petsave@mail.com</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.menuSection}>
        <button 
          className={styles.menuItem}
          onClick={handleMemberInfoClick}
        >
          <span className={styles.menuText}>회원정보 수정</span>
          <FaChevronRight className={styles.chevronIcon} />
        </button>
        
        <button 
          className={styles.menuItem}
          onClick={() => router.push('/client/pages/my-page/order-history')}
        >
          <span className={styles.menuText}>주문내역</span>
          <FaChevronRight className={styles.chevronIcon} />
        </button>
        
        <button 
          className={styles.menuItem}
          onClick={() => router.push('/client/pages/my-page/terms-and-conditions')}
        >
          <span className={styles.menuText}>약관 및 정책</span>
          <FaChevronRight className={styles.chevronIcon} />
        </button>
        
        {/* Test Logout Button */}
        <button 
          className={styles.menuItem}
          onClick={() => setShowLogoutModal(true)}
        >
          <span className={styles.menuText}>로그아웃 (테스트)</span>
          <FaChevronRight className={styles.chevronIcon} />
        </button>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          console.log('Custom logout logic executed');
          // You can add custom logout logic here
        }}
      />
    </div>
  );
}
