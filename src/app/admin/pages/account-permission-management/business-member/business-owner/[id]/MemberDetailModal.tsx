'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './MemberDetailModal.module.css';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';

interface MemberDetailModalProps {
  open: boolean;
  onClose: () => void;
  memberId?: string | null;
  requestId?: string | null;
  onUpdate?: () => void;
}

interface MemberBusinessInfo {
  requestId: string;
  applicantId: string;
  applicantName: string;
  applicantNickname: string;
  applicantEmail: string;
  applicantPhoneNumber: string;
  applicantProfileImageUrl: string;
  representativeName: string;
  businessName: string;
  businessPhoneNumber: string;
  businessHourStart: string;
  businessHourEnd: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  fullAddress: string;
  businessRegistrationNumber: string;
  businessEmail: string;
  bankName: string;
  accountNumber: string;
  depositorName: string;
  businessRegistrationCopy: string;
  bankbook: string;
  latitude: number;
  longitude: number;
  status: string;
  submittedAt: string;
  reviewedAt: string;
  reviewedBy: string;
  rejectionReason: string;
  adminNotes: string;
}

export default function MemberDetailModal({
  open,
  onClose,
  memberId,
  requestId,
  onUpdate,
}: MemberDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<MemberBusinessInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Fetch business registration info for this member */
  useEffect(() => {
    const fetchBusinessInfo = async (): Promise<void> => {
      if (!open || !requestId) return;
      setLoading(true);
      try {
        const response =
          await BusinessRegistrationService.getBusinessRegistrationByRequestId(
            requestId
          );

        if (response.error) {
          console.error('Failed to fetch business info:', response.error);
          setInfo(null);
          setLoading(false);
          return;
        }

        const apiResponse = response?.data;
        if (!apiResponse?.success) {
          console.error('Failed to fetch business info:', apiResponse);
          setInfo(null);
          setLoading(false);
          return;
        }

        // Extract data - could be array or single object
        let businessData: Record<string, unknown> | null = null;
        const responseData = apiResponse.data;

        if (Array.isArray(responseData)) {
          // If it's an array, take the first item
          businessData =
            responseData.length > 0
              ? (responseData[0] as Record<string, unknown>)
              : null;
        } else if (responseData && typeof responseData === 'object') {
          // If it's an object, check if it has a content array
          if (
            Array.isArray((responseData as { content?: unknown[] }).content)
          ) {
            const content = (responseData as { content: unknown[] }).content;
            businessData =
              content.length > 0
                ? (content[0] as Record<string, unknown>)
                : null;
          } else {
            // It's a single object
            businessData = responseData as Record<string, unknown>;
          }
        }

        if (!businessData) {
          console.error('No business data found in response');
          setInfo(null);
          setLoading(false);
          return;
        }

        // Helper function to extract file URL from various possible structures
        const getFileUrl = (fileData: unknown): string => {
          if (!fileData) return '';
          if (typeof fileData === 'string') return fileData;
          if (typeof fileData === 'object' && fileData !== null) {
            const fileObj = fileData as Record<string, unknown>;
            return (
              (fileObj.url as string) ||
              (fileObj.fileUrl as string) ||
              (fileObj.downloadUrl as string) ||
              ''
            );
          }
          return '';
        };

        // Map the data to our interface
        setInfo({
          requestId: (businessData.requestId as string) || '',
          applicantId: (businessData.applicantId as string) || '',
          applicantName: (businessData.applicantName as string) || '-',
          applicantNickname: (businessData.applicantNickname as string) || '-',
          applicantEmail:
            (businessData.businessEmail as string) ||
            (businessData.applicantEmail as string) ||
            '-',
          applicantPhoneNumber:
            (businessData.applicantPhoneNumber as string) || '-',
          applicantProfileImageUrl:
            (businessData.applicantProfileImageUrl as string) || '',
          representativeName:
            (businessData.representativeName as string) || '-',
          businessName: (businessData.businessName as string) || '-',
          businessPhoneNumber:
            (businessData.businessPhoneNumber as string) || '-',
          businessHourStart: (businessData.businessHourStart as string) || '-',
          businessHourEnd: (businessData.businessHourEnd as string) || '-',
          roadAddress: (businessData.roadAddress as string) || '-',
          detailedAddress: (businessData.detailedAddress as string) || '-',
          zipCode: (businessData.zipCode as string) || '-',
          fullAddress: (businessData.fullAddress as string) || '-',
          businessRegistrationNumber:
            (businessData.businessRegistrationNumber as string) || '-',
          businessEmail: (businessData.businessEmail as string) || '-',
          bankName: (businessData.bankName as string) || '-',
          accountNumber: (businessData.accountNumber as string) || '-',
          depositorName: (businessData.depositorName as string) || '-',
          businessRegistrationCopy:
            (businessData.businessRegistrationCopy as string) || '',
          bankbook: (businessData.bankbook as string) || '',
          latitude: (businessData.latitude as number) || 0,
          longitude: (businessData.longitude as number) || 0,
          status: (businessData.status as string) || '-',
          submittedAt: (businessData.submittedAt as string) || '-',
          reviewedAt: (businessData.reviewedAt as string) || '-',
          reviewedBy: (businessData.reviewedBy as string) || '-',
          rejectionReason: (businessData.rejectionReason as string) || '',
          adminNotes: (businessData.adminNotes as string) || '',
        });
      } catch (error) {
        console.error('Error fetching member business info:', error);
        setInfo(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchBusinessInfo();
  }, [open, requestId]);

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

  /** Handle Edit Toggle / Save */
  const handleEditToggle = async (): Promise<void> => {
    if (isEditing) {
      // Save mode
      if (!requestId || !info) return;

      setSaving(true);
      try {
        // Map the form data to the update request format
        // Only include fields that have actual values (not empty strings or '-')
        const updateData: {
          name?: string;
          nickname?: string;
          email?: string;
          phoneNumber?: string;
          roadAddress?: string;
          zipCode?: string;
          detailedAddress?: string;
          businessRegistrationCopyId?: string;
          bankbookCopyId?: string;
        } = {};

        // Helper to check if value is valid
        const isValidValue = (value: string | undefined): boolean => {
          return (
            value !== undefined && value.trim() !== '' && value.trim() !== '-'
          );
        };

        if (isValidValue(info.applicantName)) {
          updateData.name = info.applicantName.trim();
        }
        // Map applicantNickname (from GET) to nickname (for PUT)
        if (isValidValue(info.applicantNickname)) {
          const nicknameToSend = info.applicantNickname.trim();
          console.log('[Save] Sending nickname:', nicknameToSend);
          console.log('[Save] Current email value:', info.applicantEmail);
          updateData.nickname = nicknameToSend;
        }
        // Use businessEmail (from GET) for email (PUT expects 'email')
        if (isValidValue(info.applicantEmail)) {
          updateData.email = info.applicantEmail.trim();
        }
        if (isValidValue(info.applicantPhoneNumber)) {
          updateData.phoneNumber = info.applicantPhoneNumber.trim();
        }
        if (isValidValue(info.roadAddress)) {
          updateData.roadAddress = info.roadAddress.trim();
        }
        if (isValidValue(info.zipCode)) {
          updateData.zipCode = info.zipCode.trim();
        }
        if (isValidValue(info.detailedAddress)) {
          updateData.detailedAddress = info.detailedAddress.trim();
        }

        console.log('[Save] Final updateData being sent:', updateData);
        console.log('[Save] Info state at save time:', {
          applicantNickname: info.applicantNickname,
          applicantEmail: info.applicantEmail,
        });

        // Note: businessRegistrationCopyId and bankbookCopyId would need to be extracted from file URLs
        // For now, we'll leave them undefined if not provided

        const response =
          await BusinessRegistrationService.updateBusinessRegistrationByRequestId(
            requestId,
            updateData
          );

        if (response.error || !response.data?.success) {
          alert(
            '정보 수정 실패: ' + (response.error ?? response.data?.resultMsg)
          );
          setSaving(false);
          return;
        }

        alert('정보가 성공적으로 수정되었습니다.');
        setIsEditing(false);
        if (onUpdate) {
          onUpdate();
        }
        // Refetch the data to get updated values
        const fetchResponse =
          await BusinessRegistrationService.getBusinessRegistrationByRequestId(
            requestId
          );
        if (fetchResponse.data?.success && fetchResponse.data.data) {
          const businessData = fetchResponse.data.data as Record<
            string,
            unknown
          >;
          setInfo({
            requestId: (businessData.requestId as string) || '',
            applicantId: (businessData.applicantId as string) || '',
            applicantName: (businessData.applicantName as string) || '-',
            applicantNickname:
              (businessData.applicantNickname as string) || '-',
            applicantEmail:
              (businessData.businessEmail as string) ||
              (businessData.applicantEmail as string) ||
              '-',
            applicantPhoneNumber:
              (businessData.applicantPhoneNumber as string) || '-',
            applicantProfileImageUrl:
              (businessData.applicantProfileImageUrl as string) || '',
            representativeName:
              (businessData.representativeName as string) || '-',
            businessName: (businessData.businessName as string) || '-',
            businessPhoneNumber:
              (businessData.businessPhoneNumber as string) || '-',
            businessHourStart:
              (businessData.businessHourStart as string) || '-',
            businessHourEnd: (businessData.businessHourEnd as string) || '-',
            roadAddress: (businessData.roadAddress as string) || '-',
            detailedAddress: (businessData.detailedAddress as string) || '-',
            zipCode: (businessData.zipCode as string) || '-',
            fullAddress: (businessData.fullAddress as string) || '-',
            businessRegistrationNumber:
              (businessData.businessRegistrationNumber as string) || '-',
            businessEmail: (businessData.businessEmail as string) || '-',
            bankName: (businessData.bankName as string) || '-',
            accountNumber: (businessData.accountNumber as string) || '-',
            depositorName: (businessData.depositorName as string) || '-',
            businessRegistrationCopy:
              (businessData.businessRegistrationCopy as string) || '',
            bankbook: (businessData.bankbook as string) || '',
            latitude: (businessData.latitude as number) || 0,
            longitude: (businessData.longitude as number) || 0,
            status: (businessData.status as string) || '-',
            submittedAt: (businessData.submittedAt as string) || '-',
            reviewedAt: (businessData.reviewedAt as string) || '-',
            reviewedBy: (businessData.reviewedBy as string) || '-',
            rejectionReason: (businessData.rejectionReason as string) || '',
            adminNotes: (businessData.adminNotes as string) || '',
          });
        }
      } catch (error) {
        console.error('Error updating business registration:', error);
        alert('정보 수정 중 오류가 발생했습니다.');
      } finally {
        setSaving(false);
      }
    } else {
      // Edit mode - just toggle
      setIsEditing(true);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof MemberBusinessInfo
  ): void => {
    if (!info) return;
    const newValue = e.target.value;
    console.log(`[handleInputChange] Updating ${key} with value:`, newValue);
    console.log(`[handleInputChange] Current info state before update:`, {
      applicantNickname: info.applicantNickname,
      applicantEmail: info.applicantEmail,
    });
    // Use functional update to ensure we're working with latest state
    setInfo((prevInfo) => {
      if (!prevInfo) return prevInfo;
      const updated = { ...prevInfo, [key]: newValue };
      console.log(`[handleInputChange] Updated state:`, {
        applicantNickname: updated.applicantNickname,
        applicantEmail: updated.applicantEmail,
      });
      return updated;
    });
  };

  /** Handle Delete */
  const handleDelete = async (): Promise<void> => {
    if (!requestId) return;
    const confirmDelete = confirm('정말로 이 사업자 등록을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const response =
        await BusinessRegistrationService.deleteBusinessRegistration(requestId);

      if (response.error || !response.data?.success) {
        setDeleting(false);
        alert(
          '사업자 등록 삭제 실패: ' +
            (response.error ?? response.data?.resultMsg)
        );
        return;
      }

      setDeleting(false);
      onClose();
      if (onUpdate) {
        onUpdate();
      }
      setTimeout(() => {
        alert('사업자 등록이 성공적으로 삭제되었습니다.');
      }, 50);
    } catch (error) {
      console.error('Error deleting business registration:', error);
      alert('사업자 등록 삭제 중 오류가 발생했습니다.');
      setDeleting(false);
    }
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
                  src={
                    info?.applicantProfileImageUrl ||
                    '/images/profile-placeholder.png'
                  }
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
                    className={styles.valueBox}
                    value={info?.applicantName ?? ''}
                    onChange={(e) => handleInputChange(e, 'applicantName')}
                    readOnly={!isEditing || !info}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>닉네임</div>
                  <input
                    className={styles.valueBox}
                    value={info?.applicantNickname ?? ''}
                    onChange={(e) => handleInputChange(e, 'applicantNickname')}
                    readOnly={!isEditing || !info}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>이메일</div>
                  <input
                    className={styles.valueBox}
                    value={info?.applicantEmail ?? ''}
                    onChange={(e) => handleInputChange(e, 'applicantEmail')}
                    readOnly={!isEditing || !info}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>휴대폰 번호</div>
                  <input
                    className={styles.valueBox}
                    value={info?.applicantPhoneNumber ?? ''}
                    onChange={(e) =>
                      handleInputChange(e, 'applicantPhoneNumber')
                    }
                    readOnly={!isEditing || !info}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>주소</div>
                  <input
                    className={styles.valueBox}
                    value={info?.roadAddress ?? ''}
                    onChange={(e) => handleInputChange(e, 'roadAddress')}
                    readOnly={!isEditing || !info}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>상세주소</div>
                  <input
                    className={styles.valueBox}
                    value={info?.detailedAddress ?? ''}
                    onChange={(e) => handleInputChange(e, 'detailedAddress')}
                    readOnly={!isEditing || !info}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>우편번호</div>
                  <input
                    className={styles.valueBox}
                    value={info?.zipCode ?? ''}
                    onChange={(e) => handleInputChange(e, 'zipCode')}
                    readOnly={!isEditing || !info}
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.labelBox}>사업자 등록번호</div>
                  <input
                    className={styles.valueBox}
                    value={info?.businessRegistrationNumber ?? ''}
                    onChange={(e) =>
                      handleInputChange(e, 'businessRegistrationNumber')
                    }
                    readOnly={!isEditing || !info}
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
                    {info?.businessRegistrationCopy && (
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
                    {info?.bankbook && (
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
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
              <button
                type="button"
                className={styles.editBtn}
                onClick={handleEditToggle}
                disabled={saving}
              >
                {saving ? '저장 중...' : isEditing ? '저장' : '수정'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
