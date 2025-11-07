'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberInfo } from '@/app/api/types/member/member';

export default function MemberDetailPanelPage() {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch member info */
  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await MemberService.getMemberById(id);

        if (!response.data?.success || !response.data.data) {
          console.error('Failed to fetch member info:', response);
          return;
        }

        const data = response.data.data;
        setFormData(data);
      } catch (error) {
        console.error('Error fetching member info:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchMember();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Updated Member Info:', formData);
    // TODO: integrate PUT /members/{memberId} update endpoint
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

          {/* 닉네임 */}
          <div className={styles.row100}>
            <div className={styles.left80}>
              <span className={styles.leftLabel}>닉네임</span>
            </div>
            <div className={styles.right350}>
              <input
                type="text"
                name="nickname"
                value={formData.nickname ?? ''}
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
              <span className={styles.leftLabel}>우편 번호</span>
            </div>
            <div className={styles.rightStack}>
              <div className={styles.right500}>
                <input
                  type="text"
                  name="roadAddress"
                  value={formData.roadAddress ?? ''}
                  onChange={handleChange}
                  className={styles.value}
                />
              </div>
              <div className={styles.right500}>
                <input
                  type="text"
                  name="detailedAddress"
                  value={formData.detailedAddress ?? ''}
                  onChange={handleChange}
                  className={styles.value}
                />
              </div>
              <div className={styles.right500}>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode ?? ''}
                  onChange={handleChange}
                  className={styles.value}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.btnOutline}>
            삭제
          </button>
          <button type="submit" className={styles.btnPrimary}>
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
