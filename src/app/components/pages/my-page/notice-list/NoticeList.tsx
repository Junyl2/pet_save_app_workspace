"use client";

import { useRouter } from "next/navigation";
import { FaChevronRight } from "react-icons/fa";
import styles from "./NoticeList.module.css";
import { PAGE_URLS } from "@/app/utils/page_url";

interface Notice {
  id: string;
  title: string;
  preview: string;
  date?: string;
  type?: "important" | "event" | "normal";
}

const notices: Notice[] = [
  {
    id: "system-maintenance",
    title: "시스템 점검 안내",
    preview: "[8월 5일(월) 02:00~04:00]까지 시스템 점검이 진행됩니다.",
    type: "important",
  },
  {
    id: "privacy-policy",
    title: "개인정보 처리방침 개정 안내",
    preview: "2024년 9월 1일부터 새로운 개인정보 처리방침이 적용됩니다.",
    type: "normal",
  },
  {
    id: "summer-event",
    title: "여름맞이 특별 할인 이벤트!",
    preview: "8월 한 달간 모든 플랜을 30% 할인된 가격으로 만나보세요.",
    type: "event",
  },
  {
    id: "service-survey",
    title: "서비스 만족도 설문조사 참여 요청",
    preview: "추첨을 통해 커피 쿠폰을 드립니다. 소중한 의견을 들려주세요.",
    type: "normal",
  },
  {
    id: "system-maintenance-2",
    title: "시스템 점검 안내",
    preview: "[8월 5일(월) 02:00~04:00]까지 시스템 점검이 진행됩니다.",
    type: "important",
  },
  {
    id: "privacy-policy-2",
    title: "개인정보 처리방침 개정 안내",
    preview: "2024년 9월 1일부터 새로운 개인정보 처리방침이 적용됩니다.",
    type: "normal",
  },
  {
    id: "summer-event-2",
    title: "여름맞이 특별 할인 이벤트!",
    preview: "8월 한 달간 모든 플랜을 30% 할인된 가격으로 만나보세요.",
    type: "event",
  },
  {
    id: "service-survey-2",
    title: "서비스 만족도 설문조사 참여 요청",
    preview: "추첨을 통해 커피 쿠폰을 드립니다. 소중한 의견을 들려주세요.",
    type: "normal",
  },
  {
    id: "summer-event-3",
    title: "여름맞이 특별 할인 이벤트!",
    preview: "8월 한 달간 모든 플랜을 30% 할인된 가격으로 만나보세요.",
    type: "event",
  },
  {
    id: "service-survey-3",
    title: "서비스 만족도 설문조사 참여 요청",
    preview: "추첨을 통해 커피 쿠폰을 드립니다. 소중한 의견을 들려주세요.",
    type: "normal",
  },
];

export function NoticeListPage() {
  const router = useRouter();

  const handleNoticeClick = (noticeId: string) => {
    router.push(PAGE_URLS.NOTICE_DETAIL(noticeId));
  };

  return (
    <div className={styles.container}>
      <div className={styles.noticeListSection}>
        {notices.map((notice) => (
          <button
            key={notice.id}
            className={styles.noticeItem}
            onClick={() => handleNoticeClick(notice.id)}
          >
            <div className={styles.noticeContent}>
              <h3 className={styles.noticeTitle}>{notice.title}</h3>
              <p className={styles.noticePreview}>{notice.preview}</p>
              {notice.date && (
                <p className={styles.noticeDate}>{notice.date}</p>
              )}
            </div>
            <FaChevronRight className={styles.chevronIcon} />
          </button>
        ))}
      </div>
    </div>
  );
}
