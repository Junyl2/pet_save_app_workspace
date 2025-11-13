'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './CustomerInquiry.module.css';
import { AdminInquiryService } from '@/app/api/services/admin/adminInquiryService/adminInquiryService';

export default function CustomerInquiryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const data = {
    title: '공지사항 제목입니다.',
    author: '사용자 아이디',
    date: '2025-08-18',
    content:
      '사용자가 작성한 질문 내용이 이곳에 표시됩니다.\n구매한 상품에 대한 문의, 배송 관련 질문 등 긴 문장도 줄바꿈과 함께 자연스럽게 노출됩니다.',
  };

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

  const handleDelete = (): void => {
    alert('삭제 기능은 별도의 페이지에서 처리됩니다.');
  };

  return (
    <div className={styles.wrapper}>
      {/* 제목 */}
      <div className={styles.row}>
        <label className={styles.label}>제목</label>
        <div className={styles.inputBox}>{data.title}</div>
        <div className={styles.date}>{data.date}</div>
      </div>

      {/* 작성자 */}
      <div className={styles.row}>
        <label className={styles.label}>작성자</label>
        <div className={styles.inputBox}>{data.author}</div>
      </div>

      {/* 내용 */}
      <div className={styles.section}>
        <label className={styles.label}>내용</label>
        <div className={styles.contentBox}>
          <p className={styles.text}>{data.content}</p>
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
