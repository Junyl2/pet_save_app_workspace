'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  imageUrls?: string[];
}

export default function NoticeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const noticeId = params?.id as string | undefined;

  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    imageFile: null,
    imageUrls: [],
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  /** Fetch existing notice detail */
  useEffect(() => {
    const fetchNotice = async (): Promise<void> => {
      if (!noticeId) return;
      try {
        const { data, error } = await AdminNoticeService.getNoticeById(
          noticeId
        );
        if (error || !data?.data) throw new Error('공지사항 조회 실패');

        const notice = data.data;
        setForm({
          title: notice.title ?? '',
          content: notice.content ?? '',
          imageFile: null,
          imageUrls: notice.imageUrls ?? [],
        });
      } catch (err) {
        console.error('Failed to fetch notice:', err);
        showError('공지사항 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    void fetchNotice();
  }, [noticeId, showError]);

  const handleChange =
    (key: keyof NoticeForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  /** Upload + attach file -> get encryptedId */
  const uploadAndAttachImage = async (): Promise<string | null> => {
    if (!form.imageFile) return null;

    try {
      const uploadRes = await NoticeFileService.uploadFile({
        file: form.imageFile,
      });
      const uploaded: NoticeFileUploadResponse | null = uploadRes.data;
      if (!uploaded?.data?.fileId) throw new Error('File upload failed');

      const fileId = uploaded.data.fileId;
      const attachRes = await NoticeFileService.attachFiles({
        entityId: fileId,
        fileIds: [fileId],
      });
      if (!attachRes.data?.success) throw new Error('File attach failed');
      return uploaded.data.encryptedId;
    } catch (err) {
      console.error('Image upload failed:', err);
      showError('이미지 업로드 중 오류가 발생했습니다.');
      return null;
    }
  };

  /** Update notice (PUT) */
  const handleSubmit = async (): Promise<void> => {
    if (!form.title.trim() || !form.content.trim()) {
      showError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageEncryptedId: string | null = null;

      if (form.imageFile) {
        imageEncryptedId = await uploadAndAttachImage();
        if (!imageEncryptedId) throw new Error('이미지 처리 실패');
      }

      const payload = {
        title: form.title,
        content: form.content,
        imageId: imageEncryptedId || undefined,
      };

      const { data, error } = await AdminNoticeService.updateNotice(
        noticeId!,
        payload
      );
      if (error || !data?.success) throw new Error('공지사항 수정 실패');

      showSuccess('공지사항이 수정되었습니다.');
      router.push('/admin/pages/customer-service-center/announcement');
    } catch (error) {
      console.error('Failed to update notice:', error);
      showError('공지사항 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Delete notice */
  const handleDeleteClick = (): void => {
    if (!noticeId) {
      showError('삭제할 공지사항이 없습니다.');
      return;
    }
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (!noticeId) return;
    setDeleteConfirmOpen(false);

    try {
      const { data, error } = await AdminNoticeService.deleteNotice(noticeId);

      // Backend sometimes returns 404 after deletion — treat that as success
      const isDeleted =
        (data &&
          (data.success || data.status === 200 || data.status === 404)) ||
        (!data && !error); // fallback for empty but successful response

      if (isDeleted) {
        showSuccess('공지사항이 삭제되었습니다.');
        router.push('/admin/pages/customer-service-center/announcement');
        return;
      }

      console.warn('Unexpected delete response:', data);
      throw new Error('공지사항 삭제 실패');
    } catch (error) {
      console.error('Failed to delete notice:', error);
      showError('공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

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
              : form.imageUrls && form.imageUrls.length > 0
              ? '현재 등록된 이미지가 있습니다.'
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

      {/* 이미지 미리보기 (if exists) */}
      {form.imageUrls && form.imageUrls.length > 0 && (
        <div className={styles.previewBox}>
          {form.imageUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt="공지 이미지"
              className={styles.previewImage}
            />
          ))}
        </div>
      )}

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
          className={styles.btnDelete}
          onClick={handleDeleteClick}
        >
          삭제
        </button>
        <button
          type="button"
          className={styles.btnList}
          onClick={() =>
            router.push('/admin/pages/customer-service-center/announcement')
          }
        >
          목록
        </button>
        <button
          type="button"
          className={styles.btnEdit}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : '수정'}
        </button>
      </div>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  );
}
