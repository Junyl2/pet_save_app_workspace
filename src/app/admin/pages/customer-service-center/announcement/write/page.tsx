'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './WriteNotice.module.css';
import { AdminNoticeService } from '@/app/api/services/admin/adminNoticeService/adminNoticeService';
import { NoticeFileService } from '@/app/api/services/admin/adminNoticeService/noticeFileService/noticeFileService';
import { NoticeFileUploadResponse } from '@/app/api/services/admin/adminNoticeService/noticeFileService/noticeFile';
import { ConfirmationModal } from '@/app/components/admin/ui/ConfirmationModal/ConfirmationModal';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

interface NoticeForm {
  title: string;
  content: string;
  imageFile: File | null;
}

export default function WriteNoticePage() {
  const router = useRouter();
  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    imageFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleChange =
    (key: keyof NoticeForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  const handleCancelClick = (): void => {
    setCancelConfirmOpen(true);
  };

  const handleCancel = (): void => {
    setCancelConfirmOpen(false);
    router.push('/admin/pages/customer-service-center/announcement');
  };

  /** Upload file → attach → return encryptedId */
  const uploadAndAttachFile = async (): Promise<string | null> => {
    if (!form.imageFile) return null;
    try {
      // 1️⃣ Upload file
      const uploadRes = await NoticeFileService.uploadFile({
        file: form.imageFile,
      });
      const uploaded: NoticeFileUploadResponse | null = uploadRes.data;
      if (!uploaded?.data?.fileId || !uploaded?.data?.encryptedId)
        throw new Error('파일 업로드 실패');

      const fileId = uploaded.data.fileId;

      // 2️⃣ Attach file (entityId = fileId, body = [fileId])
      const attachRes = await NoticeFileService.attachFiles({
        entityId: fileId,
        fileIds: [fileId],
      });
      if (!attachRes.data?.success) throw new Error('파일 첨부 실패');

      // 3️⃣ Return encryptedId for notice create payload
      return uploaded.data.encryptedId;
    } catch (error) {
      console.error('[WriteNoticePage] 파일 업로드 오류:', error);
      showError('이미지 업로드 중 오류가 발생했습니다.');
      return null;
    }
  };

  /** Handle create notice */
  const handleSubmit = async (): Promise<void> => {
    if (!form.title.trim() || !form.content.trim()) {
      showError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageEncryptedId: string | null = null;

      if (form.imageFile) {
        imageEncryptedId = await uploadAndAttachFile();
        if (!imageEncryptedId) throw new Error('이미지 처리 실패');
      }

      // 4️⃣ Create notice
      const payload = {
        title: form.title,
        content: form.content,
        imageId: imageEncryptedId ?? undefined,
      };

      const { data, error } = await AdminNoticeService.createNotice(payload);
      if (error || !data?.success) throw new Error('공지사항 등록 실패');

      showSuccess('공지사항이 등록되었습니다.');
      router.push('/admin/pages/customer-service-center/announcement');
    } catch (error) {
      console.error('❌ Failed to create notice:', error);
      showError('공지사항 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 제목 Row */}
      <div className={styles.row}>
        <label className={styles.label}>제목</label>
        <input
          type="text"
          className={styles.input}
          placeholder="공지사항 제목을 입력하세요"
          value={form.title}
          onChange={handleChange('title')}
        />
        <div className={styles.dateBox}>
          {new Date().toISOString().slice(0, 10)}
        </div>
      </div>

      {/* 이미지 Row */}
      <div className={styles.row}>
        <label className={styles.label}>이미지</label>
        <div className={styles.inputFileBox}>
          <span className={styles.fileName}>
            {form.imageFile
              ? form.imageFile.name
              : '파일이 선택되지 않았습니다.'}
          </span>
        </div>
        <label className={styles.fileButton}>
          파일 선택
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>

      {/* 내용 Row */}
      <div className={styles.rowColumn}>
        <label className={styles.label}>내용</label>
        <textarea
          className={styles.textarea}
          placeholder="공지사항 내용을 입력하세요"
          value={form.content}
          onChange={handleChange('content')}
        />
      </div>

      {/* Bottom Buttons */}
      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={handleCancelClick}
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : '업로드'}
        </button>
      </div>

      <ConfirmationModal
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleCancel}
        message="작성 중인 내용을 취소하시겠습니까?"
        confirmText="취소"
        cancelText="돌아가기"
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  );
}
