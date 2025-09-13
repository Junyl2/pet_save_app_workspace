'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import Image from 'next/image';
import { MyPageHeader } from '@/app/components/sections/MyPageHeader/MyPageHeader';
import { PAGE_URLS } from '@/app/utils/page_url';
import styles from './MemberInformation.module.css';

export default function MemberInformation() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: 'petsave@mail.com',
    name: '펫세이브',
    phone: '010-1234-5678',
    birthdate: '1999. 07.08',
    password: '••••••••',
    address: '서울특별시 중구 양대로 407 5층'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handlePasswordClick = () => {
    router.push(PAGE_URLS.MEMBER_INFO_PASSWORD);
  };

  const handleAddressClick = () => {
    // TODO: Create address page route when needed
    router.push('/client/pages/my-page/member-information/address');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <MyPageHeader />

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
      <div className={styles.divider}></div>

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
        <button type="submit" className={styles.submitBtn}>
          수정 완료하기
        </button>
      </form>
      <div className={styles.divider}></div>
    </div>
  );
} 