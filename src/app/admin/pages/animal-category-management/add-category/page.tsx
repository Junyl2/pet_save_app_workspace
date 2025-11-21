'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Add.module.css';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { CategoryFileService } from '@/app/api/services/admin/adminCategoryService/categoryFileService';
import { ConfirmationModal } from '@/app/components/admin/ui/ConfirmationModal/ConfirmationModal';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

export default function AddCategoryPage() {
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [encryptedId, setEncryptedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteImageConfirmOpen, setDeleteImageConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    englishName: '',
    displayOrder: 1,
    visible: true,
  });
  const { toast, showSuccess, showError, hideToast } = useToast();

  /** Handle file upload */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data, error } = await CategoryFileService.uploadFile({ file });
      if (error || !data?.data) throw new Error(error || 'Upload failed');

      const uploaded = data.data;
      setUploadedFileId(uploaded.fileId);
      setEncryptedId(uploaded.encryptedId);
      setImagePreview(URL.createObjectURL(file));

      console.log('[AddCategoryPage] File uploaded:', uploaded);
      showSuccess('파일이 성공적으로 업로드되었습니다.');
    } catch (err) {
      console.error('[AddCategoryPage] File upload error:', err);
      showError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  /** Delete uploaded file */
  const handleDeleteImageClick = (): void => {
    if (!encryptedId) {
      showError('삭제할 이미지가 없습니다.');
      return;
    }

    setDeleteImageConfirmOpen(true);
  };

  const handleDeleteImage = async (): Promise<void> => {
    if (!encryptedId) {
      return;
    }

    setDeleteImageConfirmOpen(false);

    try {
      const { error } = await CategoryFileService.deleteFile(encryptedId);
      if (error) throw new Error(error);

      showSuccess('이미지가 성공적으로 삭제되었습니다.');
      setImagePreview(null);
      setUploadedFileId(null);
      setEncryptedId(null);
    } catch (err) {
      console.error('[AddCategoryPage] Delete image error:', err);
      showError('이미지 삭제 중 오류가 발생했습니다.');
    }
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

  /** Create category */
  const handleCreateCategory = async () => {
    if (!encryptedId) {
      showError('이미지를 먼저 업로드하세요.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        englishName: formData.englishName.trim(),
        displayOrder: Number(formData.displayOrder),
        visible: formData.visible,
        imageFileId: encryptedId, // must be encryptedId
      };

      console.log('[AddCategoryPage] Creating category:', payload);
      const { data, error } = await CategoryService.createCategory(payload);

      if (error) throw new Error(error);
      if (!data?.success) throw new Error(data?.resultMsg || 'Creation failed');

      showSuccess('카테고리가 성공적으로 추가되었습니다.');
      router.push('/admin/pages/animal-category-management');
    } catch (err) {
      console.error('[AddCategoryPage] Category creation failed:', err);
      showError('카테고리 추가 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {/* Top Header Section */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>동물 카테고리 관리</h1>
        <h2 className={styles.subTitle}>카테고리 목록</h2>
      </div>

      {/* Main Box */}
      <section className={styles.section}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h4 className={styles.editInfo}>기본 정보 수정</h4>
            <p className={styles.note}>
              필수 항목 수정 후 추가하기를 눌러주세요.
            </p>
          </div>
        </header>

        <div className={styles.content}>
          {/* Left Image Upload */}
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
                  src="/mock-image.jpg"
                  alt="대표 이미지"
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
                onClick={handleDeleteImageClick}
                disabled={isUploading}
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
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {/* Right Fields */}
          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>카테고리명*</label>
              <input
                type="text"
                name="name"
                className={styles.input}
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 강아지"
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
                placeholder="예: PUPPY"
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
                min={1}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Buttons */}
      <div className={styles.footerOutside}>
        <button
          type="button"
          className={styles.footerBtnWhite}
          onClick={() => router.push('/admin/pages/animal-category-management')}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.footerBtnGreen}
          onClick={handleCreateCategory}
          disabled={isUploading}
        >
          {isUploading ? '업로드 중...' : '추가하기'}
        </button>
      </div>

      <ConfirmationModal
        open={deleteImageConfirmOpen}
        onClose={() => setDeleteImageConfirmOpen(false)}
        onConfirm={handleDeleteImage}
        message="이미지를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </>
  );
}
