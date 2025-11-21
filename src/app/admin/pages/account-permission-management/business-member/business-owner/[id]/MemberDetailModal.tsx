'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './MemberDetailModal.module.css';

import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberManagementService } from '@/app/api/services/admin/memberManagementService/memberManangementService';
import { ConfirmationModal } from '@/app/components/admin/ui/ConfirmationModal/ConfirmationModal';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

import { MemberInfo, MemberUpdateRequest } from '@/app/api/types/member/member';

interface MemberDetailModalProps {
  open: boolean;
  onClose: () => void;
  memberId?: string | null;
  onUpdate?: () => void;
}

/** Local UI State (only fields rendered on screen) */
interface MemberUIFields {
  profileImageUrl: string;
  name: string;
  nickname: string;
  email: string;
  phoneNumber: string;

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
  onUpdate,
}: MemberDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<MemberUIFields | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { toast, showSuccess, showError, hideToast } = useToast();

  /** Fetch member details */
  useEffect(() => {
    const fetchMember = async () => {
      if (!open || !memberId) return;

      setLoading(true);
      try {
        const response = await MemberService.getMemberDetails(memberId);

        if (response.error || !response.data?.success) {
          console.error('Failed to fetch member details:', response.error);
          setInfo(null);
          return;
        }

        const data: MemberInfo = response.data.data;

        setInfo({
          profileImageUrl: data.profileImageUrl ?? '',
          name: data.name ?? '',
          nickname: data.nickname ?? '',
          email: data.email ?? '',
          phoneNumber: data.phoneNumber ?? '',

          roadAddress: data.roadAddress ?? '',
          detailedAddress: data.detailedAddress ?? '',
          zipCode: data.zipCode ?? '',

          businessRegistrationNumber: data.businessRegistrationNumber ?? '',
          businessRegistrationCopy: data.businessRegistrationCopy ?? '',
          bankbook: data.bankbook ?? '',
        });
      } catch (err) {
        console.error('Error fetching member details:', err);
        setInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [open, memberId]);

  /** close when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  /** Update input values */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof MemberUIFields
  ) => {
    if (!info) return;
    const val = e.target.value;
    setInfo((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  /** Save changes (PUT /members/{id}) */
  const handleSave = async () => {
    if (!memberId || !info) return;

    setSaving(true);

    try {
      const updateData: MemberUpdateRequest = {
        name: info.name || undefined,
        nickname: info.nickname || undefined,
        email: info.email || undefined,
        phoneNumber: info.phoneNumber || undefined,

        roadAddress: info.roadAddress || undefined,
        detailedAddress: info.detailedAddress || undefined,
        zipCode: info.zipCode || undefined,

        // File ID fields are NOT editable here, so we won't send them
      };

      const response = await MemberService.updateMemberInfo(
        memberId,
        updateData
      );

      if (response.error || !response.data?.success) {
        showError(response.error ?? response.data?.resultMsg ?? '수정 실패');
        setSaving(false);
        return;
      }

      showSuccess('회원 정보가 성공적으로 수정되었습니다.');
      setIsEditing(false);

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating member:', err);
      showError('정보 수정 중 오류 발생');
    } finally {
      setSaving(false);
    }
  };

  /** DELETE member */
  const handleDelete = async () => {
    if (!memberId) return;

    setDeleteConfirmOpen(false);
    setDeleting(true);

    try {
      const response = await MemberManagementService.deleteMember(memberId);

      if (response.error || !response.data?.success) {
        showError(
          response.error ?? response.data?.resultMsg ?? '회원 삭제 실패'
        );
        setDeleting(false);
        return;
      }

      showSuccess('회원이 성공적으로 삭제되었습니다.');
      onClose();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Delete error:', err);
      showError('회원 삭제 중 오류 발생');
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
              {/* Profile section */}
              <div className={styles.profileSection}>
                <div className={styles.avatarWrapper}>
                  <Image
                    src={
                      info?.profileImageUrl || '/images/profile-placeholder.png'
                    }
                    alt="Profile Avatar"
                    width={160}
                    height={160}
                    className={styles.avatarCircle}
                    priority
                  />
                </div>

                <div className={styles.infoSection}>
                  {/* NAME */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>이름</div>
                    <input
                      className={styles.valueBox}
                      value={info?.name ?? ''}
                      onChange={(e) => handleInputChange(e, 'name')}
                      readOnly={!isEditing}
                    />
                  </div>

                  {/* NICKNAME */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>닉네임</div>
                    <input
                      className={styles.valueBox}
                      value={info?.nickname ?? ''}
                      onChange={(e) => handleInputChange(e, 'nickname')}
                      readOnly={!isEditing}
                    />
                  </div>

                  {/* EMAIL */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>이메일</div>
                    <input
                      className={styles.valueBox}
                      value={info?.email ?? ''}
                      onChange={(e) => handleInputChange(e, 'email')}
                      readOnly={!isEditing}
                    />
                  </div>

                  {/* PHONE */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>휴대폰 번호</div>
                    <input
                      className={styles.valueBox}
                      value={info?.phoneNumber ?? ''}
                      onChange={(e) => handleInputChange(e, 'phoneNumber')}
                      readOnly={!isEditing}
                    />
                  </div>

                  {/* ROAD ADDRESS */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>주소</div>
                    <input
                      className={styles.valueBox}
                      value={info?.roadAddress ?? ''}
                      onChange={(e) => handleInputChange(e, 'roadAddress')}
                      readOnly={!isEditing}
                    />
                  </div>

                  {/* DETAIL ADDRESS */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>상세주소</div>
                    <input
                      className={styles.valueBox}
                      value={info?.detailedAddress ?? ''}
                      onChange={(e) => handleInputChange(e, 'detailedAddress')}
                      readOnly={!isEditing}
                    />
                  </div>

                  {/* ZIP CODE */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>우편번호</div>
                    <input
                      className={styles.valueBox}
                      value={info?.zipCode ?? ''}
                      onChange={(e) => handleInputChange(e, 'zipCode')}
                      readOnly={!isEditing}
                    />
                  </div>

                  {/* BUSINESS NUMBER */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>사업자 등록번호</div>
                    <input
                      className={styles.valueBox}
                      value={info?.businessRegistrationNumber ?? ''}
                      readOnly
                    />
                  </div>

                  {/* BUSINESS CERTIFICATE */}
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

                  {/* BANKBOOK */}
                  <div className={styles.infoRow}>
                    <div className={styles.labelBox}>통장 사본</div>
                    <div className={styles.fileBox}>
                      <input
                        className={styles.valueBox}
                        value="Bankbook.pdf"
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

              {/* BUTTONS */}
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={deleting}
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>

                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  disabled={saving}
                >
                  {saving ? '저장 중...' : isEditing ? '저장' : '수정'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        message="정말로 이 회원을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />

      {/* TOAST */}
      <ToastContainer toast={toast} onClose={hideToast} />
    </>
  );
}
