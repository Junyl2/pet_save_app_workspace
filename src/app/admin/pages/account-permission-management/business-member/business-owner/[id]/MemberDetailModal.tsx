'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './MemberDetailModal.module.css';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';

interface MemberDetailModalProps {
  open: boolean;
  onClose: () => void;
  memberId?: string | null;
}

interface MemberBusinessInfo {
  applicantName: string;
  applicantNickname: string;
  applicantEmail: string;
  applicantPhoneNumber: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
}

export default function MemberDetailModal({
  open,
  onClose,
  memberId,
}: MemberDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<MemberBusinessInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  /** Fetch business registration info for this member */
  useEffect(() => {
    const fetchBusinessInfo = async (): Promise<void> => {
      if (!open || !memberId) return;
      setLoading(true);
      try {
        const response =
          await BusinessRegistrationService.getBusinessRegistrationByMemberId(
            memberId
          );

        if (!response.data?.success) {
          console.error('Failed to fetch business info:', response);
          setInfo(null);
          return;
        }

        // Convert safely to array
        const raw = response.data.data;
        const dataArray: Record<string, unknown>[] = Array.isArray(raw)
          ? raw
          : [raw];

        if (dataArray.length === 0) {
          setInfo(null);
          return;
        }

        const data = dataArray[0];

        setInfo({
          applicantName: (data.applicantName as string) ?? '',
          applicantNickname: (data.applicantNickname as string) ?? '',
          applicantEmail: (data.applicantEmail as string) ?? '',
          applicantPhoneNumber: (data.applicantPhoneNumber as string) ?? '',
          roadAddress: (data.roadAddress as string) ?? '',
          detailedAddress: (data.detailedAddress as string) ?? '',
          zipCode: (data.zipCode as string) ?? '',
        });
      } catch (error) {
        console.error('Error fetching member business info:', error);
        setInfo(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchBusinessInfo();
  }, [open, memberId]);

  /** Close modal when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  /** Handle input change */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setInfo((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} ref={modalRef}>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : (
          <>
            {/* Profile Section */}
            <div className={styles.profileSection}>
              <div className={styles.avatarWrapper}>
                <Image
                  src="/images/profile-placeholder.png"
                  alt="Profile Avatar"
                  width={160}
                  height={160}
                  className={styles.avatarCircle}
                  priority
                />
              </div>

              <div className={styles.infoSection}>
                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>이름</div>
                  <input
                    type="text"
                    name="applicantName"
                    value={info?.applicantName ?? ''}
                    onChange={handleChange}
                    className={styles.valueInput}
                    readOnly={!isEditing}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>닉네임</div>
                  <input
                    type="text"
                    name="applicantNickname"
                    value={info?.applicantNickname ?? ''}
                    onChange={handleChange}
                    className={styles.valueInput}
                    readOnly={!isEditing}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>이메일</div>
                  <input
                    type="email"
                    name="applicantEmail"
                    value={info?.applicantEmail ?? ''}
                    onChange={handleChange}
                    className={styles.valueInput}
                    readOnly={!isEditing}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>휴대폰 번호</div>
                  <input
                    type="text"
                    name="applicantPhoneNumber"
                    value={info?.applicantPhoneNumber ?? ''}
                    onChange={handleChange}
                    className={styles.valueInput}
                    readOnly={!isEditing}
                  />
                </div>

                <div className={styles.addressRow}>
                  <div className={styles.labelBoxLarge}>우편 번호</div>
                  <div className={styles.addressBoxGroup}>
                    <input
                      type="text"
                      name="roadAddress"
                      value={info?.roadAddress ?? ''}
                      onChange={handleChange}
                      className={styles.addressInput}
                      readOnly={!isEditing}
                    />
                    <input
                      type="text"
                      name="detailedAddress"
                      value={info?.detailedAddress ?? ''}
                      onChange={handleChange}
                      className={styles.addressInput}
                      readOnly={!isEditing}
                    />
                    <input
                      type="text"
                      name="zipCode"
                      value={info?.zipCode ?? ''}
                      onChange={handleChange}
                      className={styles.addressInput}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => alert('삭제 기능 준비 중입니다.')}
              >
                삭제
              </button>
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? '저장' : '수정'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
