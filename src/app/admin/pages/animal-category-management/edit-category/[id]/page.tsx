'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import styles from './Edit.module.css';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { Category } from '@/app/api/types/category/category';

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await CategoryService.getCategoryById(id);

        if (response.error || !response.data) {
          throw new Error(response.error || 'Failed to fetch category data');
        }

        const data = response.data.data;
        setCategory(data);
      } catch (err) {
        console.error('[EditCategoryPage] Fetch error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load category data'
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchCategory();
  }, [id]);

  if (loading) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>에러 발생: {error}</div>;
  }

  if (!category) {
    return (
      <div className={styles.empty}>카테고리 정보를 찾을 수 없습니다.</div>
    );
  }

  return (
    <>
      {/* Top Header Section */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>동물 카테고리 관리</h1>
        <h2 className={styles.subTitle}>카테고리 수정</h2>
      </div>

      {/* Main Box */}
      <section className={styles.section}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h4 className={styles.editInfo}>기본 정보 수정</h4>
            <p className={styles.note}>필수 항목 수정 후 저장을 눌러주세요.</p>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {/* Left Image Upload */}
          <div className={styles.imageSection}>
            <h2 className={styles.title}>기본 정보</h2>
            <label className={styles.label}>대표 이미지*</label>
            <div className={styles.imageBox}>
              <Image
                src={
                  category.image && category.image.startsWith('http')
                    ? category.image
                    : '/images/icons/icon.png'
                }
                alt="대표 이미지"
                fill
                className={styles.image}
                sizes="217px"
                priority
              />
            </div>
            <div className={styles.imageButtons}>
              <button type="button" className={styles.deleteBtn}>
                삭제
              </button>
              <button type="button" className={styles.selectBtn}>
                파일 선택
              </button>
            </div>
          </div>

          {/* Right Fields */}
          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>카테고리명*</label>
              <input
                type="text"
                className={styles.input}
                defaultValue={category.categoryName}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>영문명 (선택)</label>
              <input
                type="text"
                className={styles.input}
                defaultValue={category.englishName}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>정렬 순서*</label>
              <input
                type="number"
                className={styles.input}
                defaultValue={category.displayOrder}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>상태</label>
              <input
                type="text"
                className={styles.input}
                value={category.visible ? '표시 중' : '숨김'}
                readOnly
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Buttons */}
      <div className={styles.footerOutside}>
        <button type="button" className={styles.footerBtnWhite}>
          삭제
        </button>
        <button
          type="button"
          className={styles.footerBtnGreen}
          onClick={() => router.push('/admin/pages/animal-category-management')}
        >
          목록
        </button>
        <button type="button" className={styles.footerBtnWhite}>
          저장
        </button>
      </div>
    </>
  );
}
