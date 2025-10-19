'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import Image from 'next/image';
import { PAGE_URLS } from '@/app/utils/page_url';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { DeliveryAddressService } from '@/app/api/services/client/memberService/member-information/deliveryAddressService';
import { MemberInfo, MemberUpdateRequest } from '@/app/api/types/member/member';
import { MemberFileService } from '@/app/api/services/client/fileService/memberFileService';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import Loading from '@/app/components/ui/Loading/Loading';
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
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Function to get profile image URL
  const getProfileImageUrl = async (profileFileId: string | undefined) => {
    if (!profileFileId) return null;

    try {
      const response = await MemberFileService.getFile(profileFileId, {
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

  // Function to fetch default delivery address
  const fetchDefaultDeliveryAddress = async () => {
    try {
      console.log('🔄 Fetching default delivery address...');
      const response = await DeliveryAddressService.getDeliveryAddresses();

      if (response.data?.success && response.data?.data) {
        const addresses = response.data.data;
        console.log('📍 All addresses:', addresses);

        const defaultAddress = addresses.find((addr) => addr.default);
        console.log('⭐ Default address found:', defaultAddress);

        if (defaultAddress) {
          const fullAddress = `${defaultAddress.roadAddress} ${defaultAddress.detailedAddress}`;
          console.log('🏠 Full address:', fullAddress);

          setFormData((prev) => ({
            ...prev,
            deliveryAddress: fullAddress,
          }));
        } else {
          // If no default address is set, use the first valid address
          const firstValidAddress = addresses.find(
            (addr) => addr.roadAddress && addr.detailedAddress
          );

          if (firstValidAddress) {
            const fullAddress = `${firstValidAddress.roadAddress} ${firstValidAddress.detailedAddress}`;
            console.log('🏠 Using first valid address:', fullAddress);

            setFormData((prev) => ({
              ...prev,
              deliveryAddress: fullAddress,
            }));
          } else {
            console.log('❌ No valid addresses found');
            setFormData((prev) => ({
              ...prev,
              deliveryAddress: '',
            }));
          }
        }
      } else {
        console.log('❌ Failed to fetch addresses:', response.error);
      }
    } catch (error) {
      console.error('💥 Error fetching default delivery address:', error);
      // Don't show error to user, just leave delivery address empty
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
            deliveryAddress: '', // Will be populated by fetchDefaultDeliveryAddress
          });

          // Fetch default delivery address
          await fetchDefaultDeliveryAddress();

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

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  // Handle file selection and preview
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setToastType('error');
      setToastMessage('지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF만 허용)');
      event.target.value = '';
      return;
    }

    // Validate file size (5MB limit for profile images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setToastType('error');
      setToastMessage('파일 크기가 5MB를 초과합니다.');
      event.target.value = '';
      return;
    }

    // Set selected file and create preview
    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setProfileImage(preview);
  };

  // Handle profile image upload
  const handleProfileImageUpload = async () => {
    if (!selectedFile || !memberInfo) return;

    try {
      setIsUploadingProfile(true);
      setError(null);

      console.log('🔄 Uploading profile image...');

      // Upload the file using MemberFileService
      const uploadResult = await MemberFileService.uploadFile(selectedFile, {
        entityType: 'member',
        entityId: memberInfo.memberId,
      });

      if (uploadResult.error) {
        setToastType('error');
        setToastMessage(uploadResult.error);
        return;
      }

      if (uploadResult.data) {
        console.log(
          '✅ Profile image uploaded successfully:',
          uploadResult.data
        );

        // Attach the file to the member entity
        const attachResult = await MemberFileService.attachFiles(
          memberInfo.memberId,
          [uploadResult.data.fileId]
        );

        if (attachResult.error) {
          setToastType('error');
          setToastMessage(attachResult.error);
          return;
        }

        // Note: Backend should automatically update profileImageUrl when file is attached
        // If not, we'll rely on the file service to provide the image URL
        console.log(
          'File attached successfully. Backend should update profileImageUrl automatically.'
        );

        // Refresh member info to get updated profileImageUrl from backend
        try {
          const refreshResponse = await MemberService.getMyInfo();
          if (refreshResponse.data?.success && refreshResponse.data?.data) {
            setMemberInfo(refreshResponse.data.data);
            console.log(
              '✅ Member info refreshed with updated profileImageUrl:',
              refreshResponse.data.data.profileImageUrl
            );
          }
        } catch (refreshError) {
          console.warn('Failed to refresh member info:', refreshError);
          // Fallback: Update local state with file data
          setMemberInfo((prev) =>
            prev
              ? {
                  ...prev,
                  profileFileId: uploadResult.data?.encryptedId,
                  profileImageUrl: uploadResult.data?.url,
                }
              : null
          );
        }

        setToastType('success');
        setToastMessage('프로필 사진이 성공적으로 변경되었습니다.');

        // Clean up preview states
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }
    } catch (error) {
      console.error('💥 Error uploading profile image:', error);
      setToastType('error');
      setToastMessage('프로필 사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingProfile(false);
    }
  };

  // Handle profile image button click
  const handleProfileImageClick = () => {
    const fileInput = document.getElementById(
      'profile-image-input'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  if (isLoading) {
    return <Loading />;
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

        {/* Hidden file input */}
        <input
          id="profile-image-input"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileSelection}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div className={styles.uploadActions}>
            <button
              className={styles.uploadBtn}
              onClick={handleProfileImageUpload}
              disabled={isUploadingProfile}
            >
              {isUploadingProfile ? '업로드 중...' : '업로드하기'}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setSelectedFile(null);
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
                // Reset to original profile image
                if (memberInfo?.profileFileId) {
                  getProfileImageUrl(memberInfo.profileFileId).then(
                    setProfileImage
                  );
                } else {
                  setProfileImage(null);
                }
                // Reset file input
                const fileInput = document.getElementById(
                  'profile-image-input'
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
              disabled={isUploadingProfile}
            >
              취소
            </button>
          </div>
        ) : (
          <button
            className={styles.profileEditBtn}
            onClick={handleProfileImageClick}
            disabled={isUploadingProfile}
          >
            <span className={styles.cameraIcon}>📷</span>
            프로필 사진 변경
          </button>
        )}
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
          <div className={styles.labelWithArrow}>
            <label className={styles.label}>비밀번호</label>
            <FaChevronRight
              onClick={() => router.push(PAGE_URLS.MEMBER_INFO_PASSWORD)}
              className={styles.chevronIcon}
            />
          </div>
          <input
            type="password"
            className={styles.input}
            value="●●●●●●●●"
            readOnly
            placeholder="●●●●●●●●"
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelWithArrow}>
            <label className={styles.label}>배송지 수정</label>
            <FaChevronRight
              onClick={() =>
                router.push(PAGE_URLS.MEMBER_INFO_DELIVERY_ADDRESS)
              }
              className={styles.chevronIcon}
            />
          </div>
          <input
            type="text"
            className={styles.input}
            value={formData.deliveryAddress}
            readOnly
            placeholder={
              formData.deliveryAddress ? '' : '등록된 배송지가 없습니다'
            }
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSaving}>
          {isSaving ? '수정 중...' : '수정 완료하기'}
        </button>
      </form>
    </div>
  );
}
