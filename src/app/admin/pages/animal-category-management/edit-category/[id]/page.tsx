'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import styles from './Edit.module.css';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { CategoryFileService } from '@/app/api/services/admin/adminCategoryService/categoryFileService';
import {
  Category,
  CategoryUpdateRequest,
} from '@/app/api/types/category/category';

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    englishName: '',
    displayOrder: 1,
    visible: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedEncryptedId, setUploadedEncryptedId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetch category by ID */
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await CategoryService.getCategoryById(id);
        if (response.error || !response.data)
          throw new Error(response.error || 'Failed to fetch category');

        const data = response.data.data as Category;
        setCategory(data);
        setFormData({
          name: data.categoryName,
          englishName: data.englishName,
          displayOrder: data.displayOrder,
          visible: data.visible,
        });

        if (data.image) setImagePreview(data.image);
      } catch (err) {
        console.error('[EditCategoryPage] Fetch error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load category'
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchCategory();
  }, [id]);

  /** Upload & attach image */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      const { data, error } = await CategoryFileService.uploadFile({ file });
      if (error || !data?.data) throw new Error(error || 'Upload failed');

      const uploaded = data.data;
      setUploadedEncryptedId(uploaded.encryptedId);
      setImagePreview(URL.createObjectURL(file));

      await CategoryFileService.attachFiles(id, { fileIds: [uploaded.fileId] });
    } catch (err) {
      console.error('[EditCategoryPage] File upload error:', err);
      alert('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  /** Delete uploaded image */
  const handleDeleteImage = async () => {
    if (!uploadedEncryptedId && !category?.image) {
      alert('삭제할 이미지가 없습니다.');
      return;
    }

    const targetEncryptedId =
      uploadedEncryptedId || extractEncryptedId(category?.image);
    if (!targetEncryptedId) {
      alert('유효한 이미지 ID를 찾을 수 없습니다.');
      return;
    }

    const confirmed = window.confirm('이미지를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const { error } = await CategoryFileService.deleteFile(targetEncryptedId);
      if (error) throw new Error(error);

      alert('이미지가 성공적으로 삭제되었습니다.');
      setImagePreview(null);
      setUploadedEncryptedId(null);
    } catch (err) {
      console.error('[EditCategoryPage] Delete image error:', err);
      alert('이미지 삭제 중 오류가 발생했습니다.');
    }
  };

  /** Extract encryptedId from image URL if API returns full path */
  const extractEncryptedId = (url?: string | null): string | null => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1] || null;
  };

  /** Handle field changes */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === 'checkbox';

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? target.checked : value,
    }));
  };

  /** Save updated category */
  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);

    try {
      const payload: CategoryUpdateRequest = {
        name: formData.name.trim(),
        englishName: formData.englishName.trim(),
        displayOrder: Number(formData.displayOrder),
        visible: formData.visible,
        imageFileIds: uploadedEncryptedId
          ? [uploadedEncryptedId]
          : category?.image
          ? []
          : [],
      };

      const { error } = await CategoryService.updateCategory(id, payload);
      if (error) throw new Error(error);

      alert('카테고리 정보가 성공적으로 수정되었습니다.');
      router.push('/admin/pages/animal-category-management');
    } catch (err) {
      console.error('[EditCategoryPage] Update error:', err);
      alert('카테고리 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;
  if (error) return <div className={styles.error}>에러 발생: {error}</div>;
  if (!category)
    return (
      <div className={styles.empty}>카테고리 정보를 찾을 수 없습니다.</div>
    );

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>동물 카테고리 관리</h1>
        <h2 className={styles.subTitle}>카테고리 수정</h2>
      </div>

      <section className={styles.section}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h4 className={styles.editInfo}>기본 정보 수정</h4>
            <p className={styles.note}>필수 항목 수정 후 저장을 눌러주세요.</p>
          </div>
        </header>

        <div className={styles.content}>
          {/* Left: Image Upload */}
          <div className={styles.imageSection}>
            <h2 className={styles.title}>기본 정보</h2>
            <label className={styles.label}>대표 이미지*</label>

            <div className={styles.imageBox}>
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="대표 이미지"
                  fill
                  className={styles.image}
                  sizes="217px"
                  priority
                />
              ) : (
                <Image
                  src="/images/icons/icon.png"
                  alt="기본 이미지"
                  fill
                  className={styles.image}
                  sizes="217px"
                  priority
                />
              )}
            </div>

            <div className={styles.imageButtons}>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDeleteImage}
                disabled={isSaving}
              >
                삭제
              </button>
              <label className={styles.selectBtn}>
                파일 선택
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileSelect}
                  disabled={isSaving}
                />
              </label>
            </div>
          </div>

          {/* Right: Info Fields */}
          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>카테고리명*</label>
              <input
                type="text"
                name="name"
                className={styles.input}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>영문명 (선택)</label>
              <input
                type="text"
                name="englishName"
                className={styles.input}
                value={formData.englishName}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>정렬 순서*</label>
              <input
                type="number"
                name="displayOrder"
                className={styles.input}
                value={formData.displayOrder}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info note outside the border */}
      <div className={styles.outsideNote}>
        <span className={styles.icon}>⚠️</span>
        변경 사항은 저장 전까지 실제 서비스에 반영되지 않습니다.
      </div>

      <div className={styles.footerOutside}>
        <button
          type="button"
          className={styles.footerBtnWhite}
          onClick={() => router.push('/admin/pages/animal-category-management')}
        >
          목록
        </button>
        <button
          type="button"
          className={styles.footerBtnGreen}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </>
  );
}
