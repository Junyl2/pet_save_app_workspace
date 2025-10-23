'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import styles from './NoticeList.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';
import { noticeService } from '@/app/api/services/client/memberService/notice/noticeService';
import { Notice } from '@/app/api/types/member/notice/notice';
import Loading from '@/app/components/ui/Loading/Loading';

export function NoticeListPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await noticeService.searchNotices({
          page: 0,
          size: 20,
          sortBy: 'createdAt',
          direction: 'desc',
        });

        console.log('Notice API Response:', response);

        if (response.data && !response.error) {
          // Check if the response has the expected structure
          if (response.data.content && Array.isArray(response.data.content)) {
            setNotices(response.data.content);
          } else {
            console.error('Unexpected response structure:', response.data);
            setError('공지사항 데이터 형식이 올바르지 않습니다.');
          }
        } else {
          const errorMessage =
            response.error || '공지사항을 불러오는데 실패했습니다.';
          setError(errorMessage);
        }
      } catch (err) {
        setError('공지사항을 불러오는데 실패했습니다.');
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const handleNoticeClick = (noticeId: string) => {
    router.push(PAGE_URLS.NOTICE_DETAIL(noticeId));
  };

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

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.noticeListSection}>
          <div
            style={{ padding: '20px', textAlign: 'center', color: '#e74c3c' }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!notices || notices.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noticeListSection}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            등록된 공지사항이 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.noticeListSection}>
        {notices.map((notice) => (
          <button
            key={notice.noticeId}
            className={styles.noticeItem}
            onClick={() => handleNoticeClick(notice.noticeId)}
          >
            <div className={styles.noticeContent}>
              <h3 className={styles.noticeTitle}>{notice.title}</h3>
              <p className={styles.noticePreview}>{notice.summary}</p>
              <p className={styles.noticeDate}>
                {formatDate(notice.createdAt)}
              </p>
            </div>
            <FaChevronRight className={styles.chevronIcon} />
          </button>
        ))}
      </div>
    </div>
  );
}
