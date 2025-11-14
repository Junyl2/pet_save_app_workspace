'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './CustomerInquiry.module.css';
import { AdminInquiryService } from '@/app/api/services/admin/adminInquiryService/adminInquiryService';
import { AdminInquiryItem } from '@/app/api/services/admin/adminInquiryService/adminInquiry';
import { ReviewImageGallery } from '@/app/components/ui/Gallery/ReviewImageGallery';

export default function CustomerInquiryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<AdminInquiryItem | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInquiry = async (): Promise<void> => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await AdminInquiryService.getInquiryById(id);
        if (error || !data?.data) throw new Error();
        setInquiry(data.data);
      } catch {
        alert('문의 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    void loadInquiry();
  }, [id]);

  const handleSubmit = async (): Promise<void> => {
    if (!id) {
      alert('문의 ID가 유효하지 않습니다.');
      return;
    }
    if (!answer.trim()) {
      alert('답변 내용을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: response, error } = await AdminInquiryService.createAnswer(
        id,
        { answer }
      );

      if (error || !response?.success) {
        throw new Error(response?.resultMsg || '답변 등록 실패');
      }

      alert('답변이 성공적으로 등록되었습니다.');
      router.push('/admin/pages/customer-service-center/customer-inquiry');
    } catch (err) {
      console.error(err);
      alert('답변 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!id || !confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { error } = await AdminInquiryService.deleteInquiry(id);
      if (error) throw new Error();
      alert('삭제가 완료되었습니다.');
      router.push('/admin/pages/customer-service-center/customer-inquiry');
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (!inquiry)
    return <div className={styles.error}>데이터를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      {/* 제목 */}
      <div className={styles.row}>
        <label className={styles.label}>제목</label>
        <div className={styles.inputBox}>
          {inquiry.product?.productName ?? '문의 제목 없음'}
        </div>
        <div className={styles.date}>
          {inquiry.createdAt ? inquiry.createdAt.slice(0, 10) : '-'}
        </div>
      </div>

      {/* 작성자 */}
      <div className={styles.row}>
        <label className={styles.label}>작성자</label>
        <div className={styles.inputBox}>
          {inquiry.inquirer?.name ?? '익명'}
        </div>
      </div>

      {/* 내용 */}
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

      {/* 답변 */}
      <div className={styles.section}>
        <label className={styles.label}>답변</label>
        <textarea
          className={styles.textarea}
          placeholder="답변 내용을 입력해 주세요."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* Buttons */}
      <div className={styles.buttonRow}>
        <button
          className={styles.btnDelete}
          onClick={handleDelete}
          disabled={submitting}
        >
          삭제
        </button>
        <button
          className={styles.btnSubmit}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '등록 중...' : '답변 등록'}
        </button>
        <button
          className={styles.btnClose}
          onClick={() =>
            router.push('/admin/pages/customer-service-center/customer-inquiry')
          }
          disabled={submitting}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
