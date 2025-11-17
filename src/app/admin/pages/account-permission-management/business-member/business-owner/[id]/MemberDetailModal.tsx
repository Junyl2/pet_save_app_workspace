'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './MemberDetailModal.module.css';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';
import { ConfirmationModal } from '@/app/components/admin/ui/ConfirmationModal/ConfirmationModal';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

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
  requestId,
  onUpdate,
}: MemberDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<MemberBusinessInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { toast, showSuccess, showError, hideToast } = useToast();

  /** Fetch business info */
  useEffect(() => {
    const fetchBusinessInfo = async (): Promise<void> => {
      if (!open || !requestId) return;

      setLoading(true);
      try {
        const response =
          await BusinessRegistrationService.getBusinessRegistrationByRequestId(
            requestId
          );

        if (response.error || !response.data?.success) {
          console.error('Failed to fetch business info:', response.error);
          setInfo(null);
          return;
        }

        const responseData = response.data.data;
        let businessData: Record<string, unknown> | null = null;

        if (Array.isArray(responseData)) {
          businessData = responseData[0] ?? null;
        } else if (responseData && typeof responseData === 'object') {
          if (Array.isArray((responseData as any).content)) {
            businessData = (responseData as any).content[0] ?? null;
          } else {
            businessData = responseData as Record<string, unknown>;
          }
        }

        if (!businessData) {
          setInfo(null);
          return;
        }

        setInfo({
          requestId: (businessData.requestId as string) ?? '',
          applicantId: (businessData.applicantId as string) ?? '',
          applicantName: (businessData.applicantName as string) ?? '-',
          applicantNickname: (businessData.applicantNickname as string) ?? '-',
          applicantEmail:
            (businessData.businessEmail as string) ??
            (businessData.applicantEmail as string) ??
            '-',
          applicantPhoneNumber:
            (businessData.applicantPhoneNumber as string) ?? '-',
          applicantProfileImageUrl:
            (businessData.applicantProfileImageUrl as string) ?? '',
          representativeName:
            (businessData.representativeName as string) ?? '-',
          businessName: (businessData.businessName as string) ?? '-',
          businessPhoneNumber:
            (businessData.businessPhoneNumber as string) ?? '-',
          businessHourStart: (businessData.businessHourStart as string) ?? '-',
          businessHourEnd: (businessData.businessHourEnd as string) ?? '-',
          roadAddress: (businessData.roadAddress as string) ?? '-',
          detailedAddress: (businessData.detailedAddress as string) ?? '-',
          zipCode: (businessData.zipCode as string) ?? '-',
          fullAddress: (businessData.fullAddress as string) ?? '-',
          businessRegistrationNumber:
            (businessData.businessRegistrationNumber as string) ?? '-',
          businessEmail: (businessData.businessEmail as string) ?? '-',
          bankName: (businessData.bankName as string) ?? '-',
          accountNumber: (businessData.accountNumber as string) ?? '-',
          depositorName: (businessData.depositorName as string) ?? '-',
          businessRegistrationCopy:
            (businessData.businessRegistrationCopy as string) ?? '',
          bankbook: (businessData.bankbook as string) ?? '',
          latitude: (businessData.latitude as number) ?? 0,
          longitude: (businessData.longitude as number) ?? 0,
          status: (businessData.status as string) ?? '-',
          submittedAt: (businessData.submittedAt as string) ?? '-',
          reviewedAt: (businessData.reviewedAt as string) ?? '-',
          reviewedBy: (businessData.reviewedBy as string) ?? '-',
          rejectionReason: (businessData.rejectionReason as string) ?? '',
          adminNotes: (businessData.adminNotes as string) ?? '',
        });
      } catch (error) {
        console.error('Error fetching business info:', error);
        setInfo(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchBusinessInfo();
  }, [open, requestId]);

  /** Close modal when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  /** Input change handler */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof MemberBusinessInfo
  ): void => {
    if (!info) return;
    const newValue = e.target.value;
    setInfo((prev) => (prev ? { ...prev, [key]: newValue } : prev));
  };

  /** Handle Save */
  const handleEditToggle = async (): Promise<void> => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!requestId || !info) return;

    setSaving(true);

    try {
      const updateData: Record<string, string> = {};

      const addIfValid = (field: string, value: string): void => {
        if (value?.trim() && value !== '-') {
          updateData[field] = value.trim();
        }
      };

      addIfValid('name', info.applicantName);
      addIfValid('nickname', info.applicantNickname);
      addIfValid('email', info.applicantEmail);
      addIfValid('phoneNumber', info.applicantPhoneNumber);
      addIfValid('roadAddress', info.roadAddress);
      addIfValid('zipCode', info.zipCode);
      addIfValid('detailedAddress', info.detailedAddress);

      const response =
        await BusinessRegistrationService.updateBusinessRegistrationByRequestId(
          requestId,
          updateData
        );

      if (response.error || !response.data?.success) {
        showError(
          response.error ??
            response.data?.resultMsg ??
            '정보 수정 실패했습니다.'
        );
        setSaving(false);
        return;
      }

      showSuccess('정보가 성공적으로 수정되었습니다.');
      setIsEditing(false);

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating business info:', error);
      showError('정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  /** Open delete confirmation modal */
  const handleDeleteClick = (): void => {
    setDeleteConfirmOpen(true);
  };

  /** Handle delete */
  const handleDelete = async (): Promise<void> => {
    if (!requestId) return;

    setDeleteConfirmOpen(false);
    setDeleting(true);

    try {
      const response =
        await BusinessRegistrationService.deleteBusinessRegistration(requestId);

      if (response.error || !response.data?.success) {
        showError(
          response.error ?? response.data?.resultMsg ?? '사업자 등록 삭제 실패'
        );
        setDeleting(false);
        return;
      }

      showSuccess('사업자 등록이 성공적으로 삭제되었습니다.');
      onClose();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting business registration:', error);
      showError('사업자 등록 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className={styles.backdrop}>
        <div className={styles.modal} ref={modalRef}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : (
            <>
              {/* original UI remains exactly the same */}
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
                  {/* All rows unchanged */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>이름</div>
                    <input
                      className={styles.valueBox}
                      value={info?.applicantName ?? ''}
                      onChange={(e) => handleInputChange(e, 'applicantName')}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>닉네임</div>
                    <input
                      className={styles.valueBox}
                      value={info?.applicantNickname ?? ''}
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
                      value={info?.applicantEmail ?? ''}
                      onChange={(e) => handleInputChange(e, 'applicantEmail')}
                      readOnly={!isEditing}
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
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>주소</div>
                    <input
                      className={styles.valueBox}
                      value={info?.roadAddress ?? ''}
                      onChange={(e) => handleInputChange(e, 'roadAddress')}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>상세주소</div>
                    <input
                      className={styles.valueBox}
                      value={info?.detailedAddress ?? ''}
                      onChange={(e) => handleInputChange(e, 'detailedAddress')}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>우편번호</div>
                    <input
                      className={styles.valueBox}
                      value={info?.zipCode ?? ''}
                      onChange={(e) => handleInputChange(e, 'zipCode')}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>사업자 등록번호</div>
                    <input
                      className={styles.valueBox}
                      value={info?.businessRegistrationNumber ?? ''}
                      readOnly
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

              {/* Buttons */}
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={handleDeleteClick}
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

      {/* DELETE CONFIRM MODAL */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        message="정말로 이 사업자 등록을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />

      {/* TOAST */}
      <ToastContainer toast={toast} onClose={hideToast} />
    </>
  );
}
