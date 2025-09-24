"use client";

import { useParams } from "next/navigation";
import styles from "./NoticeDetail.module.css";

type Notice = {
  title: string;
  date: string;
  content: {
    schedule?: {
      title: string;
      items: string[];
    };
    impact?: {
      title: string;
      items: string[];
    };
    precautions?: {
      title: string;
      items: string[];
    };
  };
  serviceMessage?: {
    title: string;
    text: string;
  };
  contact?: {
    title: string;
    items: string[];
  };
};

// This would typically come from an API or database
const noticeData: Record<string, Notice> = {
  "system-maintenance": {
    title: "시스템 점검 안내",
    date: "2025.07.31",
    content: {
      schedule: {
        title: "점검 일시",
        items: [
          "2025년 8월 5일(월)",
          "오전 2:00 ~ 오전 4:00 (총 2시간 예정)",
          "※ 작업 상황에 따라 점검 시간이 변경되거나 조기 종료될 수 있습니다.",
        ],
      },
      impact: {
        title: "점검 영향",
        items: [
          "앱 접속 불가",
          "상품 조회, 주문, 결제, 마이페이지 등 모든 서비스 이용 일시 중단",
          "푸시 알림 및 배송 상태 알림도 일시 중단될 수 있습니다.",
        ],
      },
      precautions: {
        title: "고객 유의사항",
        items: [
          "점검 시간 이전에 미리 주문 및 결제를 완료해주시길 권장드립니다.",
          "점검 시간 중 결제 중단으로 인한 주문 실패에 대해서는 고객센터를 통해 문의해 주세요.",
          "쿠폰 사용 기한이 점검 시간과 겹실 경우, 고객센터로 연락 주시면 유효기간 연장 처리해드립니다.",
        ],
      },
    },
    serviceMessage: {
      title: "서비스 이용에 불편을 드려 죄송합니다",
      text: "더 나은 안정적인 서비스 환경을 제공하기 위한 조치이오니 고객님의 너른 양해 부탁드립니다.\n앞으로도 최고의 서비스로 보답하겠습니다.",
    },
    contact: {
      title: "고객센터",
      items: [
        "운영시간: 평일 오전 9시 ~ 오후 6시",
        "전화: 1588-XXXX",
        "이메일: help@petstore.co.kr",
      ],
    },
  },
};

export function NoticeDetailPage() {
  const params = useParams();
  const noticeId = params?.noticeId as string;

  const notice = noticeData[noticeId];

  if (!notice) {
    return (
      <div className={styles.container}>
        <h1 className={styles.noticeTitle}>공지사항을 찾을 수 없습니다</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <h1 className={styles.noticeTitle}>{notice.title}</h1>
      <p className={styles.noticeDate}>{notice.date}</p>

      {/* Divider */}
      <hr className={styles.divider} />

      {/* Schedule */}
      {notice.content.schedule && (
        <>
          <h2 className={styles.sectionTitle}>
            {notice.content.schedule.title}
          </h2>
          <ul className={styles.contentList}>
            {notice.content.schedule.items.map((item: string, index: number) =>
              item.includes("※") ? (
                // Render as a note (outside <li>)
                <p key={index} className={styles.warning}>
                  {item}
                </p>
              ) : (
                // Render as a normal list item
                <li key={index}>
                  {item.includes("2025년") ? (
                    <span className={styles.highlight}>{item}</span>
                  ) : item.includes("오전") ? (
                    <span className={styles.timeRange}>{item}</span>
                  ) : (
                    item
                  )}
                </li>
              )
            )}
          </ul>
        </>
      )}

      {/* Impact */}
      {notice.content.impact && (
        <>
          <h2 className={styles.sectionTitle}>{notice.content.impact.title}</h2>
          <ul className={styles.contentList}>
            {notice.content.impact.items.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {/* Precautions */}
      {notice.content.precautions && (
        <>
          <h2 className={styles.sectionTitle}>
            {notice.content.precautions.title}
          </h2>
          <ul className={styles.contentList}>
            {notice.content.precautions.items.map(
              (item: string, index: number) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </>
      )}

      {/* Service Message */}
      {notice.serviceMessage && (
        <>
          <h2 className={styles.sectionTitle}>{notice.serviceMessage.title}</h2>
          <div className={styles.serviceMessage}>
            {notice.serviceMessage.text
              .split("\n")
              .map((line: string, index: number) => (
                <p key={index}>{line}</p>
              ))}
          </div>
        </>
      )}

      {/* Contact */}
      {notice.contact && (
        <>
          <h2 className={styles.contactTitle}>{notice.contact.title}</h2>
          <ul className={styles.contactList}>
            {notice.contact.items.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
