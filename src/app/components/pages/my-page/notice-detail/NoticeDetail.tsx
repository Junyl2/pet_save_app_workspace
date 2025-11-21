'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './NoticeDetail.module.css';
import { noticeService } from '@/app/api/services/client/memberService/notice/noticeService';
import { Notice } from '@/app/api/types/member/notice/notice';
import Loading from '@/app/components/ui/Loading/Loading';

export function NoticeDetailPage() {
  const params = useParams();
  const noticeId = params?.noticeId as string;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!noticeId) {
        setError('공지사항 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await noticeService.getNoticeById(noticeId);

        if (response.data && !response.error) {
          setNotice(response.data);
        } else {
          setError('공지사항을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('공지사항을 불러오는데 실패했습니다.');
        console.error('Error fetching notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !notice) {
    return (
      <div className={styles.container}>
        <h1 className={styles.noticeTitle}>공지사항을 찾을 수 없습니다</h1>
        {error && (
          <div
            style={{ padding: '20px', textAlign: 'center', color: '#e74c3c' }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <h1 className={styles.noticeTitle}>{notice.title}</h1>
      <p className={styles.noticeDate}>{formatDate(notice.createdAt)}</p>

      {/* Divider */}
      <hr className={styles.divider} />

      {/* Content */}
      <div className={styles.content}>
        {notice.content.split('\n').map((line, index) => {
          // Handle markdown-style formatting
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <h2 key={index} className={styles.sectionTitle}>
                {line.replace(/\*\*/g, '')}
              </h2>
            );
          }

          if (line.startsWith('- **')) {
            const cleanLine = line.replace(/^-\s*\*\*/, '').replace(/\*\*/, '');
            return (
              <h3 key={index} className={styles.subSectionTitle}>
                {cleanLine}
              </h3>
            );
          }

          if (line.startsWith('- ')) {
            return (
              <li key={index} className={styles.listItem}>
                {line.replace(/^-\s*/, '')}
              </li>
            );
          }

          if (line.trim() === '') {
            return <br key={index} />;
          }

          if (line.includes('※')) {
            return (
              <p key={index} className={styles.warning}>
                {line}
              </p>
            );
          }

          return (
            <p key={index} className={styles.paragraph}>
              {line}
            </p>
          );
        })}
      </div>

      {/* Images */}
      {notice.imageUrls && notice.imageUrls.length > 0 && (
        <div className={styles.imageContainer}>
          {notice.imageUrls.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Notice image ${index + 1}`}
              className={styles.noticeImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
