"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./ProfileHeader.module.css";
import Image from "next/image";
import { PAGE_URLS } from "@/app/utils/page_url";

const ProfileHeader = () => {
  const router = useRouter();

  const actions = [
    {
      label: "주문 내역",
      route: PAGE_URLS.ORDER_HISTORY,

      icon: "/images/icons/mypage-note.svg",
    },
    {
      label: "리뷰",
      route: "/mypage/reviews",
      icon: "/images/icons/mypage-take-note.svg",
    },
    {
      label: "찜한 상품",
      route: PAGE_URLS.STEAMED_PRODUCTS,
      icon: "/images/icons/mypage-heart.svg",
    },
    {
      label: "포인트",
      route: PAGE_URLS.MYPAGE_POINTS,
      icon: "/images/icons/mypage-star.svg",
    },
  ];
  const sources = [
    "https://i.pravatar.cc/100?img=1", // random avatar
    "https://i.pravatar.cc/100?img=2",
  ];
  const randomSrc = sources[Math.floor(Math.random() * sources.length)];

  return (
    <div className={styles.profileHeader}>
      {/* Top row */}
      <div className={styles.topRow}>
        <div className={styles.profileImage}>
          <Image
            src={randomSrc}
            alt="Profile"
            width={100}
            height={100}
            className={styles.profileImage}
          />
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.username}>펫세이브</span>
        </div>
        <button className={styles.editButton}>수정하기</button>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        {actions.map((action) => (
          <div
            key={action.label}
            className={styles.quickActionItem}
            onClick={() => router.push(action.route)}
          >
            <Image
              src={action.icon}
              alt={action.label}
              className={styles.actionIcon}
              height={28}
              width={28}
            />
            <span>{action.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
