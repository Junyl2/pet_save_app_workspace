'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import Image from 'next/image';
import { PAGE_URLS } from '@/app/utils/page_url';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberInfo } from '@/app/api/types/member/member';
import { FileService } from '@/app/api/services/client/fileService/fileService';
import styles from './MemberInformation.module.css';

export default function MemberInformation() {
  const router = useRouter();

  // State for member data and loading/error states
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Function to get profile image URL
  const getProfileImageUrl = async (profileFileId: string | undefined) => {
    if (!profileFileId) return null;

    try {
      const response = await FileService.getFile(profileFileId, {
        disposition: 'inline',
        type: 'original',
      });

      if (response.data) {
        return URL.createObjectURL(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error getting profile image:', error);
      return null;
    }
  };

  // Fetch member information on component mount
  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 Fetching member info for MemberInformation...');

        const response = await MemberService.getMyInfo();

        if (response.error) {
          console.error('❌ Failed to fetch member info:', response.error);
          setError('회원 정보를 불러오는데 실패했습니다.');
          return;
        }

        if (response.data?.success && response.data?.data) {
          const memberData = response.data.data;
          console.log('✅ Member info fetched successfully:', memberData);
          console.log('🔍 Member ID:', memberData.memberId);
          console.log(
            '🔍 Full member data structure:',
            JSON.stringify(memberData, null, 2)
          );

          setMemberInfo(memberData);

          // Load profile image if available
          if (memberData.profileFileId) {
            const imageUrl = await getProfileImageUrl(memberData.profileFileId);
            setProfileImage(imageUrl);
          }
        } else {
          setError('회원 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('💥 Error fetching member info:', err);
        setError('회원 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberInfo();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>회원 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.errorContainer}>
          <div className={styles.error}>{error}</div>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!memberInfo) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.errorContainer}>
          <div className={styles.error}>회원 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProductHeader />

      <div className={styles.content}>
        {/* Profile Image Section */}
        <div className={styles.profileSection}>
          <div className={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={100}
                height={100}
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.defaultProfileImage}>
                <Image
                  src="/images/icons/profile-default.png"
                  alt="Default Profile"
                  width={100}
                  height={100}
                />
              </div>
            )}
          </div>
        </div>

        {/* Member Information */}
        <div className={styles.infoSection}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>이메일</div>
            <div className={styles.infoValue}>
              {memberInfo.email || '정보 없음'}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>이름</div>
            <div className={styles.infoValue}>
              {memberInfo.name || '정보 없음'}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>전화번호</div>
            <div className={styles.infoValue}>
              {memberInfo.phoneNumber || '정보 없음'}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>생년월일</div>
            <div className={styles.infoValue}>
              {memberInfo.birthDate ? (
                <div className={styles.birthdateContainer}>
                  <IoCalendarOutline className={styles.calendarIcon} />
                  {memberInfo.birthDate}
                </div>
              ) : (
                '정보 없음'
              )}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>배송 주소</div>
            <div className={styles.infoValue}>
              {memberInfo.deliveryAddress || memberInfo.location || '정보 없음'}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>회원 역할</div>
            <div className={styles.infoValue}>
              {memberInfo.role || '정보 없음'}
            </div>
          </div>

          {memberInfo.businessApprovalStatus && (
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>사업자 승인 상태</div>
              <div className={styles.infoValue}>
                <span
                  className={`${styles.status} ${
                    styles[memberInfo.businessApprovalStatus.toLowerCase()]
                  }`}
                >
                  {memberInfo.businessApprovalStatus}
                </span>
              </div>
            </div>
          )}

          {memberInfo.storeId && (
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>스토어 ID</div>
              <div className={styles.infoValue}>{memberInfo.storeId}</div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className={styles.navigationSection}>
          <button
            className={styles.navButton}
            onClick={() => router.push(PAGE_URLS.MEMBER_INFO_PASSWORD)}
          >
            <span>비밀번호 변경</span>
            <FaChevronRight className={styles.chevronIcon} />
          </button>

          <button
            className={styles.navButton}
            onClick={() => router.push(PAGE_URLS.MYPAGE_WITHDRAWAL)}
          >
            <span>회원 탈퇴</span>
            <FaChevronRight className={styles.chevronIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}
