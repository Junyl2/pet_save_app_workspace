'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './MemberDetailModal.module.css';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberInfo, MemberUpdateRequest } from '@/app/api/types/member/member';
import { MemberManagementService } from '@/app/api/services/admin/memberManagementService/memberManangementService';

interface MemberDetailModalProps {
  open: boolean;
  onClose: () => void;
  memberId?: string | null;
  onUpdate?: () => void;
}

export default function MemberDetailModal({
  open,
  onClose,
  memberId,
  onUpdate,
}: MemberDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** Fetch member detailed info (ADMIN/OWNER only) */
  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      if (!open || !memberId) return;
      setLoading(true);
      try {
        const response = await MemberService.getMemberDetails(memberId);

        if (!response.data?.success || !response.data.data) {
          console.error('Failed to fetch member details:', response);
          setFormData(null);
          return;
        }

        setFormData(response.data.data);
      } catch (error) {
        console.error('Error fetching member details:', error);
        setFormData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchMember();
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
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  /** Handle Save (PUT /members/{memberId}) */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData || !memberId) return;

    setSaving(true);
    try {
      const payload: MemberUpdateRequest = {
        email: formData.email,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        deliveryAddress: formData.roadAddress,
      };

      const res = await MemberService.updateMemberInfo(memberId, payload);

      if (res.error || !res.data?.success) {
        alert('회원 정보 수정 실패: ' + (res.error ?? res.data?.resultMsg));
        return;
      }

      alert('회원 정보가 성공적으로 수정되었습니다.');
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
      alert('회원 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  /** Handle Delete */
  const handleDelete = async (): Promise<void> => {
    if (!memberId) return;
    const confirmDelete = confirm('정말로 이 회원을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const response = await MemberManagementService.deleteMember(memberId);

      if (response.error || !response.data?.success) {
        setDeleting(false);
        alert(
          '회원 삭제 실패: ' + (response.error ?? response.data?.resultMsg)
        );
        return;
      }

      setDeleting(false);
      onClose();
      if (onUpdate) {
        onUpdate();
      }
      setTimeout(() => {
        alert('회원이 성공적으로 삭제되었습니다.');
      }, 50);
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('회원 삭제 중 오류가 발생했습니다.');
      setDeleting(false);
    }
  };

  if (!open) return null;

  if (loading || !formData) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal} ref={modalRef}>
          <div className={styles.loading}>불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} ref={modalRef}>
        <form className={styles.panel} onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className={styles.avatar}>
            <Image
              src={formData.profileImageUrl || '/images/logo/per-saves.png'}
              alt="Avatar"
              fill
              className={styles.thumb}
            />
          </div>

          {/* Form Stack */}
          <div className={styles.stack}>
            {/* 이름 */}
            <div className={styles.row100}>
              <div className={styles.left80}>
                <span className={styles.leftLabel}>이름</span>
              </div>
              <div className={styles.right350}>
                <input
                  type="text"
                  name="name"
                  value={formData.name ?? ''}
                  onChange={handleChange}
                  className={styles.value}
                />
              </div>
            </div>

            {/* 이메일 */}
            <div className={styles.row100}>
              <div className={styles.left80}>
                <span className={styles.leftLabel}>이메일</span>
              </div>
              <div className={styles.right350}>
                <input
                  type="email"
                  name="email"
                  value={formData.email ?? ''}
                  onChange={handleChange}
                  className={styles.value}
                />
              </div>
            </div>

            {/* 휴대폰 번호 */}
            <div className={styles.row100}>
              <div className={styles.left80}>
                <span className={styles.leftLabel}>휴대폰 번호</span>
              </div>
              <div className={styles.right350}>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber ?? ''}
                  onChange={handleChange}
                  className={styles.value}
                />
              </div>
            </div>

            {/* 주소 + 상세 */}
            <div className={styles.row160}>
              <div className={styles.left140}>
                <span className={styles.leftLabel}>주소</span>
              </div>
              <div className={styles.rightStack}>
                <div className={styles.right500}>
                  <input
                    type="text"
                    name="roadAddress"
                    value={formData.roadAddress ?? ''}
                    onChange={handleChange}
                    className={styles.value}
                    placeholder="도로명 주소"
                  />
                </div>
                <div className={styles.right500}>
                  <input
                    type="text"
                    name="detailedAddress"
                    value={formData.detailedAddress ?? ''}
                    onChange={handleChange}
                    className={styles.value}
                    placeholder="상세 주소"
                  />
                </div>
                <div className={styles.right500}>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode ?? ''}
                    onChange={handleChange}
                    className={styles.value}
                    placeholder="우편번호"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnOutline}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={saving}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
