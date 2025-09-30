'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import Image from 'next/image';
import { PAGE_URLS } from '@/app/utils/page_url';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberInfo, MemberUpdateRequest } from '@/app/api/types/member/member';
import { FileService } from '@/app/api/services/client/fileService/fileService';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import styles from './MemberInformation.module.css';

export default function MemberInformation() {
  const router = useRouter();

  // State for member data and loading/error states
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Form state for editable fields
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phoneNumber: '',
    birthDate: '',
    deliveryAddress: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

          // Populate form data
          setFormData({
            email: memberData.email || '',
            name: memberData.name || '',
            phoneNumber: memberData.phoneNumber || '',
            birthDate: memberData.birthDate || '',
            deliveryAddress: memberData.defaultDeliveryAddress
              ? `${memberData.defaultDeliveryAddress.roadAddress} ${memberData.defaultDeliveryAddress.detailedAddress}`
              : memberData.deliveryAddress || memberData.location || '',
          });

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

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving || !memberInfo) return;

    try {
      setIsSaving(true);
      setError(null);

      // Prepare update data
      const updateData: MemberUpdateRequest = {
        email: formData.email,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate,
        deliveryAddress: formData.deliveryAddress,
      };

      console.log('Updating member info with data:', updateData);

      // Call API to update member information
      const response = await MemberService.updateMemberInfo(
        memberInfo.memberId,
        updateData
      );

      if (response.error) {
        setToastType('error');
        setToastMessage(response.error);
      } else if (response.data?.success) {
        setToastType('success');
        setToastMessage('회원 정보가 성공적으로 수정되었습니다.');

        // Update local member info with the response data
        if (response.data.data) {
          setMemberInfo(response.data.data);
        }
      } else {
        setToastType('error');
        setToastMessage('회원 정보 수정에 실패했습니다.');
      }
    } catch (err) {
      setToastType('error');
      setToastMessage(
        err instanceof Error ? err.message : '회원 정보 수정에 실패했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toast close
  const handleToastClose = () => {
    setToastMessage(null);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <div className={styles.label}>회원 정보를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <div className={styles.label} style={{ color: '#dc3545' }}>
              {error}
            </div>
            <button
              className={styles.submitBtn}
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!memberInfo) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <div className={styles.label} style={{ color: '#dc3545' }}>
              회원 정보를 찾을 수 없습니다.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProductHeader />

      {/* Toast Message */}
      {toastMessage && (
        <ToastMessage
          message={toastMessage}
          onClose={handleToastClose}
          duration={toastType === 'error' ? 5000 : 3000}
        />
      )}

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
            <Image
              src="/images/icons/profile-default.png"
              alt="Default Profile"
              width={100}
              height={100}
              className={styles.profileImage}
            />
          )}
        </div>
        <button className={styles.profileEditBtn}>
          <span className={styles.cameraIcon}>📷</span>
          프로필 사진 변경
        </button>
      </div>

      {/* Member Information Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>이메일</label>
          <input
            type="email"
            className={styles.input}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>이름</label>
          <input
            type="text"
            className={styles.input}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>휴대폰 번호</label>
          <input
            type="tel"
            className={styles.input}
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="휴대폰 번호를 입력하세요"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>내 정보</label>
          <div className={styles.inputWithIcon}>
            <input
              type="date"
              className={styles.input}
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
            <IoCalendarOutline className={styles.calendarIcon} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>배송지 수정</label>
          <div className={styles.inputWithIcon}>
            <input
              type="text"
              className={styles.input}
              value={formData.deliveryAddress}
              onChange={(e) =>
                handleInputChange('deliveryAddress', e.target.value)
              }
              placeholder="배송지를 입력하세요"
            />
            <FaChevronRight className={styles.chevronIcon} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>비밀번호</label>
          <div className={styles.inputWithIcon}>
            <input
              type="password"
              className={styles.input}
              value="●●●●●●●●"
              readOnly
              placeholder="●●●●●●●●"
              onClick={() => router.push(PAGE_URLS.MEMBER_INFO_PASSWORD)}
            />
            <FaChevronRight className={styles.chevronIcon} />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSaving}>
          {isSaving ? '수정 중...' : '수정 완료하기'}
        </button>
      </form>
    </div>
  );
}
