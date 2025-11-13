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
  businessRegistrationNumber: string;
  businessRegistrationCopy: string;
  bankbook: string;
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

        const dataArray = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        if (dataArray.length === 0) {
          setInfo(null);
          return;
        }

        const data = dataArray[0] as Record<string, unknown>;

        setInfo({
          applicantName: (data.applicantName as string) ?? '-',
          applicantNickname: (data.applicantNickname as string) ?? '-',
          applicantEmail: (data.applicantEmail as string) ?? '-',
          applicantPhoneNumber: (data.applicantPhoneNumber as string) ?? '-',
          roadAddress: (data.roadAddress as string) ?? '-',
          detailedAddress: (data.detailedAddress as string) ?? '-',
          zipCode: (data.zipCode as string) ?? '-',
          businessRegistrationNumber:
            (data.businessRegistrationNumber as string) ?? '-',
          businessRegistrationCopy:
            (data.businessRegistrationCopy as string) ?? '',
          bankbook: (data.bankbook as string) ?? '',
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

  if (!open) return null;

  const handleEditToggle = (): void => setIsEditing((prev) => !prev);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof MemberBusinessInfo
  ): void => {
    if (!info) return;
    setInfo({ ...info, [key]: e.target.value });
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} ref={modalRef}>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : (
          <>
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
                {info && (
                  <>
                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>이름</div>
                      <input
                        className={styles.valueBox}
                        value={info.applicantName}
                        onChange={(e) => handleInputChange(e, 'applicantName')}
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>닉네임</div>
                      <input
                        className={styles.valueBox}
                        value={info.applicantNickname}
                        onChange={(e) =>
                          handleInputChange(e, 'applicantNickname')
                        }
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>이메일</div>
                      <input
                        className={styles.valueBox}
                        value={info.applicantEmail}
                        onChange={(e) => handleInputChange(e, 'applicantEmail')}
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>휴대폰 번호</div>
                      <input
                        className={styles.valueBox}
                        value={info.applicantPhoneNumber}
                        onChange={(e) =>
                          handleInputChange(e, 'applicantPhoneNumber')
                        }
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>주소</div>
                      <input
                        className={styles.valueBox}
                        value={info.roadAddress}
                        onChange={(e) => handleInputChange(e, 'roadAddress')}
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>상세주소</div>
                      <input
                        className={styles.valueBox}
                        value={info.detailedAddress}
                        onChange={(e) =>
                          handleInputChange(e, 'detailedAddress')
                        }
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>우편번호</div>
                      <input
                        className={styles.valueBox}
                        value={info.zipCode}
                        onChange={(e) => handleInputChange(e, 'zipCode')}
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>사업자 등록번호</div>
                      <input
                        className={styles.valueBox}
                        value={info.businessRegistrationNumber}
                        onChange={(e) =>
                          handleInputChange(e, 'businessRegistrationNumber')
                        }
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>사업자 등록증</div>
                      <div className={styles.fileBox}>
                        <input
                          className={styles.valueBox}
                          value="Certificate.pdf"
                          readOnly
                        />
                        {info.businessRegistrationCopy && (
                          <a
                            href={info.businessRegistrationCopy}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewBtn}
                          >
                            보기
                          </a>
                        )}
                      </div>
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.labelBox}>통장 사본</div>
                      <div className={styles.fileBox}>
                        <input
                          className={styles.valueBox}
                          value="Bank Account Copy.pdf"
                          readOnly
                        />
                        {info.bankbook && (
                          <a
                            href={info.bankbook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewBtn}
                          >
                            보기
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.deleteBtn}>
                삭제
              </button>
              <button
                type="button"
                className={styles.editBtn}
                onClick={handleEditToggle}
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
