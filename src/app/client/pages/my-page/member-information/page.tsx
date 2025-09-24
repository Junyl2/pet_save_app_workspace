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
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import styles from './MemberInformation.module.css';

export default function MemberInformation() {
  const router = useRouter();

  // State for member data and loading/error states
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [originalFormData, setOriginalFormData] = useState({
    email: '',
    name: '',
    phone: '',
    birthdate: '',
    address: '',
  });

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    birthdate: '',
    password: '••••••••',
    address: '',
  });

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

          // Update form data with real API data
          const initialFormData = {
            email: memberData.email || '',
            name: memberData.name || '',
            phone: memberData.phoneNumber || '',
            birthdate: memberData.birthDate || '',
            password: '••••••••',
            address: memberData.deliveryAddress || memberData.location || '',
          };

          setFormData(initialFormData);
          setOriginalFormData({
            email: memberData.email || '',
            name: memberData.name || '',
            phone: memberData.phoneNumber || '',
            birthdate: memberData.birthDate || '',
            address: memberData.deliveryAddress || memberData.location || '',
          });
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

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.name !== originalFormData.name ||
      formData.phone !== originalFormData.phone ||
      formData.birthdate !== originalFormData.birthdate ||
      formData.address !== originalFormData.address
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setShowToast(false);

      console.log('🔄 Submitting member information update...', formData);
      console.log('🔍 Current memberInfo:', memberInfo);
      console.log('🔍 Member ID:', memberInfo?.memberId);

      // Check if we have member info with ID
      if (!memberInfo?.memberId) {
        console.error('❌ No member ID found in memberInfo:', memberInfo);
        setSubmitError(
          '회원 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.'
        );
        return;
      }

      // Prepare update data - only include fields that can be updated
      const updateData: MemberUpdateRequest = {
        name: formData.name,
        phoneNumber: formData.phone,
        deliveryAddress: formData.address,
        email: formData.email, // Include email if it can be updated
        birthDate: formData.birthdate || undefined, // Include birthdate if provided
        profileFileId: memberInfo.profileFileId, // Keep existing profile file ID
      };

      console.log('🔍 Calling updateMemberById with:', {
        memberId: memberInfo.memberId,
        updateData: updateData,
      });

      let response;

      // Try updating with memberId first
      try {
        response = await MemberService.updateMemberById(
          memberInfo.memberId,
          updateData
        );

        console.log('🔍 Update response (by ID):', response);

        // If memberId approach fails, try the fallback method
        if (
          response.error &&
          (response.error.includes('404') ||
            response.error.includes('not found'))
        ) {
          console.log('🔄 MemberId approach failed, trying fallback method...');
          response = await MemberService.updateMyInfo(updateData);
          console.log('🔍 Update response (fallback):', response);
        }
      } catch (error) {
        console.log(
          '🔄 MemberId approach failed with exception, trying fallback method...'
        );
        response = await MemberService.updateMyInfo(updateData);
        console.log('🔍 Update response (fallback):', response);
      }

      if (response.error) {
        console.error('❌ Failed to update member info:', response.error);
        setSubmitError(`회원 정보 업데이트에 실패했습니다: ${response.error}`);
        return;
      }

      if (response.data?.success) {
        console.log('✅ Member info updated successfully:', response.data);

        // Update local state with the new data
        if (response.data.data) {
          setMemberInfo(response.data.data);

          // Update original form data to reflect the new state
          const updatedData = response.data.data;
          setOriginalFormData({
            email: updatedData.email || '',
            name: updatedData.name || '',
            phone: updatedData.phoneNumber || '',
            birthdate: updatedData.birthDate || '',
            address: updatedData.deliveryAddress || updatedData.location || '',
          });
        }

        // Show success toast
        setShowToast(true);
      } else {
        setSubmitError('회원 정보 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('💥 Error updating member info:', err);
      setSubmitError('회원 정보 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordClick = () => {
    router.push(PAGE_URLS.MEMBER_INFO_PASSWORD);
  };

  const handleAddressClick = () => {
    // TODO: Create address page route when needed
    router.push('/client/pages/my-page/member-information/address');
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <ProductHeader />
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>회원 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <ProductHeader />
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'red' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        {/* Profile Image Section */}
        <div className={styles.profileSection}>
          <div className={styles.profileImageContainer}>
            <Image
              src="/images/animals/강아지.png"
              alt="프로필"
              width={100}
              height={100}
              className={styles.profileImage}
            />
          </div>
          <button className={styles.profileEditBtn}>
            <span className={styles.cameraIcon}>📷</span>
            프로필 사진 변경
          </button>
        </div>

        {/* Error Messages */}

        {submitError && (
          <div
            style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
          >
            ❌ {submitError}
          </div>
        )}

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              readOnly
            />
          </div>

          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          {/* Phone */}
          <div className={styles.formGroup}>
            <label className={styles.label}>휴대폰 번호</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          {/* Birthdate */}
          <div className={styles.formGroup}>
            <label className={styles.label}>내 정보</label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className={styles.input}
              />
              <IoCalendarOutline className={styles.calendarIcon} />
            </div>
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>비밀번호</label>
            <div className={styles.inputWithIcon}>
              <input
                type="password"
                name="password"
                value="••••••••"
                className={styles.input}
                readOnly
                onClick={handlePasswordClick}
              />
              <FaChevronRight className={styles.chevronIcon} />
            </div>
          </div>

          {/* Address */}
          <div className={styles.formGroup}>
            <label className={styles.label}>배송지 수정</label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                name="address"
                value={formData.address}
                className={styles.input}
                readOnly
                onClick={handleAddressClick}
              />
              <FaChevronRight className={styles.chevronIcon} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !hasChanges()}
            style={{
              opacity: isSubmitting || !hasChanges() ? 0.6 : 1,
              cursor: isSubmitting || !hasChanges() ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? '업데이트 중...' : '수정 완료하기'}
          </button>
        </form>
      </div>

      {/* Toast Message */}
      {showToast && (
        <ToastMessage
          message="회원 정보가 성공적으로 업데이트되었습니다!"
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </>
  );
}
