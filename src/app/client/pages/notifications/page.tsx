'use client';
import { MyPageHeader } from '@/app/components/sections/MyPageHeader/MyPageHeader';
import { FaArrowRight } from 'react-icons/fa';
import styles from './Notifications.module.css';

interface Notification {
  id: number;
  category: string;
  title: string;
  action: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const notifications: Notification[] = [
    {
      id: 1,
      category: '상품 문의',
      title: '문의했던 내용의 답변이 도착했어요!',
      action: '바로 확인하기',
      isRead: false
    },
    {
      id: 2,
      category: '주문/픽업',
      title: '주문하신 상품이 준비되었습니다.',
      action: '픽업 확인하기',
      isRead: false
    },
    {
      id: 3,
      category: '앱 내 문의',
      title: '문의했던 내용의 답변이 도착했어요!',
      action: '바로 확인하기',
      isRead: false
    },
    {
      id: 4,
      category: '주문/배송',
      title: '주문하신 상품이 발송되었습니다.',
      action: '배송 조회하기',
      isRead: false
    },
    {
      id: 5,
      category: '상품 문의',
      title: '문의했던 내용의 답변이 도착했어요!',
      action: '바로 확인하기',
      isRead: false
    },
    {
      id: 6,
      category: '주문/픽업',
      title: '주문하신 상품이 준비되었습니다.',
      action: '픽업 확인하기',
      isRead: false
    },
    {
      id: 7,
      category: '앱 내 문의',
      title: '문의했던 내용의 답변이 도착했어요!',
      action: '바로 확인하기',
      isRead: false
    },
    {
      id: 8,
      category: '주문/배송',
      title: '주문하신 상품이 발송되었습니다.',
      action: '배송 조회하기',
      isRead: false
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <MyPageHeader />

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {notifications.map((notification) => (
          <div key={notification.id} className={styles.notificationItem}>
            <div className={styles.notificationContent}>
              <div className={styles.category}>{notification.category}</div>
              <h3 className={styles.title}>{notification.title}</h3>
              <button className={styles.actionButton}>
                {notification.action} <FaArrowRight className={styles.arrowIcon} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 