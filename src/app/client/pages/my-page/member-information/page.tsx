'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
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

type Address = {
  default?: boolean;
  roadAddress?: string;
  detailedAddress?: string;
};

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
    birthdate: '',
    deliveryAddress: '',
  });

  // Track a newly uploaded (but not yet saved) profile file id
  const [pendingProfileFileId, setPendingProfileFileId] = useState<
    string | null
  >(null);

  // Save / toast (only for final confirm edit)
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Upload state
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Utility: objectURL cleanup
  const revokeObjectURL = useCallback((url: string | null) => {
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* noop */
      }
    }
  }, []);

  // Prefer backend-provided profileImageUrl; fall back to file service if needed
  const resolveProfileImage = useCallback(async (info: MemberInfo) => {
    const directUrl = info.profileImageUrl ?? null;
    if (directUrl) {
      setProfileImage(directUrl);
      return;
    }
    const profileFileId = info.profileFileId;
    if (!profileFileId) {
      setProfileImage(null);
      return;
    }
    try {
      const response = await MemberFileService.getFile(profileFileId, {
        disposition: 'inline',
        type: 'original',
      });
      if (response?.data) {
        const objUrl = URL.createObjectURL(response.data);
        setProfileImage(objUrl);
      } else {
        setProfileImage(null);
      }
    } catch (e) {
      console.error('Error getting profile image:', e);
      setProfileImage(null);
    }
  }, []);

  // Function to fetch default delivery address
  const fetchDefaultDeliveryAddress = useCallback(async () => {
    try {
      const response = await DeliveryAddressService.getDeliveryAddresses();
      if (response.data?.success && response.data?.data) {
        const addresses = response.data.data as Address[];
        const defaultAddress = addresses.find((addr) => addr.default);
        const chosen =
          defaultAddress ||
          addresses.find((addr) => addr.roadAddress && addr.detailedAddress);
        const fullAddress = chosen
          ? `${chosen.roadAddress ?? ''} ${chosen.detailedAddress ?? ''}`.trim()
          : '';
        setFormData((prev) => ({ ...prev, deliveryAddress: fullAddress }));
      } else {
        console.warn('Failed to fetch addresses:', response.error);
      }
    } catch (fetchErr) {
      console.error('Error fetching default delivery address:', fetchErr);
      // Non-blocking
    }
  }, []);

  // Fetch member information on component mount
  useEffect(() => {
    let didCancel = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await MemberService.getMyInfo();
        if (response.error) {
          console.error('Failed to fetch member info:', response.error);
          if (!didCancel) setError('회원 정보를 불러오는데 실패했습니다.');
          return;
        }

        if (response.data?.success && response.data?.data) {
          const memberData = response.data.data as MemberInfo;
          if (!didCancel) {
            setMemberInfo(memberData);
            setFormData({
              email: memberData.email ?? '',
              name: memberData.name ?? '',
              phoneNumber: memberData.phoneNumber ?? '',
              birthdate: (memberData.birthdate ?? '').slice(0, 10), // normalize format
              deliveryAddress: memberData.deliveryAddress ?? '',
            });
          }

          await fetchDefaultDeliveryAddress();
          if (!didCancel) await resolveProfileImage(memberData);
        } else {
          if (!didCancel) setError('회원 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('Error fetching member info:', err);
        if (!didCancel)
          setError('회원 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (!didCancel) setIsLoading(false);
      }
    })();

    return () => {
      didCancel = true;
    };
  }, [fetchDefaultDeliveryAddress, resolveProfileImage]);

  // Cleanup preview URL on unmount or change
  useEffect(() => {
    return () => revokeObjectURL(previewUrl);
  }, [previewUrl, revokeObjectURL]);

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helpers
  const valueOrInfo = (
    formVal: string | undefined,
    infoVal: string | undefined
  ) => {
    const fv = (formVal ?? '').trim();
    if (fv) return fv;
    const iv = (infoVal ?? '').trim();
    return iv; // may be empty if truly not set on server
  };
  const normalizeDate = (v: string | undefined) => (v ? v.slice(0, 10) : '');

  // Build full PUT body (send ALL fields) but never send empty profileFileId
  const buildFullPut = (
    form: typeof formData,
    info: MemberInfo
  ): MemberUpdateRequest => {
    const email = valueOrInfo(form.email, info.email);
    const name = valueOrInfo(form.name, info.name);
    const phoneNumber = valueOrInfo(form.phoneNumber, info.phoneNumber);
    const birthDate = normalizeDate(
      valueOrInfo(form.birthdate, info.birthdate)
    );
    const deliveryAddress = valueOrInfo(
      form.deliveryAddress,
      info.deliveryAddress
    );

    // Use a precise type instead of `any`
    const body: Partial<MemberUpdateRequest> = {
      email,
      name,
      phoneNumber,
      birthDate,
      deliveryAddress,
    };

    // Include profileFileId only if we actually have one (pending or existing)
    const effectiveProfileId =
      pendingProfileFileId ?? info.profileFileId ?? null;
    if (effectiveProfileId && String(effectiveProfileId).trim().length > 0) {
      body.profileFileId = effectiveProfileId;
    }

    return body as MemberUpdateRequest;
  };

  // Handle form submission (full object)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (isSaving || !memberInfo) return;

    try {
      setIsSaving(true);
      setError(null);

      const updateData = buildFullPut(formData, memberInfo);
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

        if (response.data.data) {
          const updated = response.data.data as MemberInfo;
          setMemberInfo(updated);
          setFormData({
            email: updated.email ?? '',
            name: updated.name ?? '',
            phoneNumber: updated.phoneNumber ?? '',
            birthdate: (updated.birthdate ?? '').slice(0, 10),
            deliveryAddress: updated.deliveryAddress ?? '',
          });
          await resolveProfileImage(updated);
        }
        // Clear pending profile id after successful confirm
        setPendingProfileFileId(null);
      } else {
        setToastType('error');
        setToastMessage('회원 정보 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setToastType('error');
      setToastMessage('회원 정보 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toast close (used only for final confirm edit)
  const handleToastClose = () => setToastMessage(null);

  // Handle file selection and preview
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.warn('Unsupported file type.');
      event.currentTarget.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.warn('File exceeds 5MB.');
      event.currentTarget.value = '';
      return;
    }

    // Set selected file and create preview (local only)
    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    revokeObjectURL(previewUrl);
    setPreviewUrl(preview);
    setProfileImage(preview);
  };

  /**
   * New Image Flow (kept):
   * 1) Upload image → get { encryptedId } and store in state (pendingProfileFileId)
   * 2) On "수정 완료하기" → full PUT with all fields + profileFileId (if present)
   * 3) Refresh UI after confirm
   */
  const handleProfileImageUpload = async () => {
    if (!selectedFile || !memberInfo || isUploadingProfile) return;
    try {
      setIsUploadingProfile(true);
      setError(null);

      const uploadResult = await MemberFileService.uploadFile(selectedFile, {
        entityType: 'member',
        entityId: memberInfo.memberId,
      });

      if (uploadResult.error || !uploadResult.data) {
        console.error('Upload failed:', uploadResult.error);
        return;
      }

      const encryptedId: string | undefined = uploadResult.data.encryptedId;
      if (!encryptedId) {
        console.error('No encryptedId in upload response.');
        return;
      }

      setPendingProfileFileId(encryptedId);

      // Cleanup preview/input selection
      setSelectedFile(null);
      const fileInput = document.getElementById(
        'profile-image-input'
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Error uploading profile image:', err);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  // Handle profile image button click
  const handleProfileImageClick = () => {
    const fileInput = document.getElementById(
      'profile-image-input'
    ) as HTMLInputElement | null;
    fileInput?.click();
  };

  if (isLoading) return <Loading />;

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

      {/* Toast Message (shown only for final confirm edit) */}
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
            <img
              src={profileImage}
              alt="Profile"
              className={styles.profileImage}
            />
          ) : (
            <img
              src="/images/icons/profile-default.png"
              alt="Default Profile"
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
                revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                // Reset preview to original from backend if needed
                if (memberInfo) {
                  resolveProfileImage(memberInfo);
                } else {
                  setProfileImage(null);
                }
                // Reset input
                const fileInput = document.getElementById(
                  'profile-image-input'
                ) as HTMLInputElement | null;
                if (fileInput) fileInput.value = '';
                // Also clear pending change if user cancels
                setPendingProfileFileId(null);
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
            <Image
              src="/images/icons/camera.svg"
              alt="Camera"
              width={16}
              height={14}
            />
            프로필 사진 변경
          </button>
        )}
      </div>

      <div className={styles.divider} />

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
              value={formData.birthdate}
              onChange={(e) => handleInputChange('birthdate', e.target.value)}
            />
            <Image
              src="/images/icons/Calendar.svg"
              alt="Calendar"
              width={15}
              height={17}
              className={styles.calendarIcon}
            />
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
          <input type="password" className={styles.input} value="" readOnly />
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
      </form>

      {/* Fixed Bottom Submit Button Container */}
      <div className={styles.submitButtonContainer}>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={() => handleSubmit()}
          disabled={isSaving}
        >
          {isSaving ? '수정 중...' : '수정 완료하기'}
        </button>
      </div>
    </div>
  );
}
