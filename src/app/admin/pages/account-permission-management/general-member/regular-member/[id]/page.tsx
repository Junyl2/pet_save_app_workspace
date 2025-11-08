'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberInfo, MemberUpdateRequest } from '@/app/api/types/member/member';

export default function MemberDetailPanelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /** Fetch member detailed info (ADMIN/OWNER only) */
  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await MemberService.getMemberDetails(id);

        if (!response.data?.success || !response.data.data) {
          console.error('Failed to fetch member details:', response);
          return;
        }

        setFormData(response.data.data);
      } catch (error) {
        console.error('Error fetching member details:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchMember();
  }, [id]);

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
    if (!formData || !id) return;

    setSaving(true);
    try {
      const payload: MemberUpdateRequest = {
        email: formData.email,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        deliveryAddress: formData.roadAddress,
      };

      const res = await MemberService.updateMemberInfo(id, payload);

      if (res.error || !res.data?.success) {
        alert('회원 정보 수정 실패: ' + (res.error ?? res.data?.resultMsg));
        return;
      }

      alert('회원 정보가 성공적으로 수정되었습니다.');
      router.push('/admin/pages/account-permission-management/general-member');
    } catch (error) {
      console.error('Error updating member:', error);
      alert('회원 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  /** Handle Delete (placeholder for future use) */
  const handleDelete = async (): Promise<void> => {
    if (!id) return;
    const confirmDelete = confirm('정말로 이 회원을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    alert('삭제 기능은 아직 구현되지 않았습니다.');
  };

  if (loading || !formData) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
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
          >
            삭제
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
