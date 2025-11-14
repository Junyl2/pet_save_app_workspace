'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './AnsweredInquiry.module.css';
import { AdminInquiryService } from '@/app/api/services/admin/adminInquiryService/adminInquiryService';
import { AdminInquiryItem } from '@/app/api/services/admin/adminInquiryService/adminInquiry';
import { ReviewImageGallery } from '@/app/components/ui/Gallery/ReviewImageGallery';

export default function AnsweredInquiryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<AdminInquiryItem | null>(null);
  const [editableAnswer, setEditableAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInquiry = async (): Promise<void> => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await AdminInquiryService.getInquiryById(id);
        if (error || !data?.data) throw new Error();
        setInquiry(data.data);
        setEditableAnswer(data.data.answer ?? '');
      } catch {
        alert('문의 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    void loadInquiry();
  }, [id]);

  const handleDelete = async (): Promise<void> => {
    if (!id || !confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      const { error } = await AdminInquiryService.deleteInquiry(id);
      if (error) throw new Error();
      alert('삭제가 완료되었습니다.');
      router.push(
        '/admin/pages/customer-service-center/customer-inquiry/answer-completed'
      );
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  /** ✅ Fixed edit → save toggle and PUT call */
  const handleEditToggle = async (): Promise<void> => {
    if (!id) return;

    // If entering edit mode
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // If saving
    if (!editableAnswer.trim()) {
      alert('답변 내용을 입력하세요.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await AdminInquiryService.updateAnswer(id, {
        answer: editableAnswer.trim(),
      });
      if (error) throw new Error(error);
      alert('답변이 성공적으로 수정되었습니다.');
      setInquiry((prev) =>
        prev ? { ...prev, answer: editableAnswer.trim() } : prev
      );
      setIsEditing(false);
    } catch {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (!inquiry)
    return <div className={styles.error}>데이터를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <label className={styles.label}>제목</label>
        <div className={styles.inputBox}>
          {inquiry.product?.productName ?? '문의 제목 없음'}
        </div>
        <div className={styles.date}>
          {inquiry.createdAt ? inquiry.createdAt.slice(0, 10) : '-'}
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.label}>작성자</label>
        <div className={styles.inputBox}>
          {inquiry.inquirer?.name ?? '익명'}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>내용</label>
        <div className={styles.contentBox}>
          <p className={styles.text}>{inquiry.content ?? '-'}</p>
          {inquiry.imageUrls && inquiry.imageUrls.length > 0 && (
            <div className={styles.imagesContainer}>
              <ReviewImageGallery images={inquiry.imageUrls} />
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>답변</label>
        <div className={styles.answerBox}>
          {isEditing ? (
            <textarea
              className={styles.textarea}
              value={editableAnswer}
              onChange={(e) => setEditableAnswer(e.target.value)}
              placeholder="답변을 입력하세요."
            />
          ) : (
            <p className={styles.text}>
              {inquiry.answer || '등록된 답변이 없습니다.'}
            </p>
          )}
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button
          className={styles.btnDelete}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? '삭제 중...' : '삭제'}
        </button>
        <button
          className={styles.btnList}
          onClick={() =>
            router.push(
              '/admin/pages/customer-service-center/customer-inquiry/answer-completed'
            )
          }
        >
          목록
        </button>
        <button
          className={styles.btnEdit}
          onClick={handleEditToggle}
          disabled={saving}
        >
          {isEditing ? (saving ? '저장 중...' : '저장') : '수정'}
        </button>
      </div>
    </div>
  );
}
