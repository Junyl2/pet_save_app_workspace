'use client';
import { MyPageHeader } from '@/app/components/sections/MyPageHeader/MyPageHeader';
import styles from './PointsGuide.module.css';

export default function PointsGuidePage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <MyPageHeader />

      {/* Title */}
      <div className={styles.titleSection}>
        <span className={styles.icon}>📍</span>
        <h1 className={styles.title}>포인트 이용 안내</h1>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. 포인트 적립 기준</h2>
          <ul className={styles.list}>
            <li>모든 포인트는 이벤트 참여, 마산 완료, 구매 등 특정 조건을 만족할 경우 지급됩니다.</li>
            <li>적립 조건 및 지급 시점은 이벤트별로 상이할 수 있으며, 별도 공지사항 또는 이벤트 페이지를 통해 확인 가능합니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. 포인트 사용처</h2>
          <ul className={styles.list}>
            <li>적립된 포인트는 (상품 구매 / 할인 / 경품 응모 등)에 사용할 수 있습니다.</li>
            <li>사용 가능한 최소 포인트는 (예: 1,000P)부터이며, 일부 상품은 포인트 사용이 제한될 수 있습니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. 포인트 유효기간</h2>
          <ul className={styles.list}>
            <li>포인트는 지급일로부터 (예: 1년간 유효하며, 유효기간이 지난 포인트는 자동 소멸됩니다.</li>
            <li>유효기간은 앱 내 '포인트 내역'에서 확인할 수 있습니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. 포인트 소멸 안내</h2>
          <ul className={styles.list}>
            <li>유효기간 만료 또는 탈퇴 시 포인트는 자동 소멸되며, 복구되지 않습니다.</li>
            <li>부정한 방법에 따라 획득이 가능한 경우에는 고객센터를 통해 환불 요청이 가능합니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. 포인트 양도 및 현금화</h2>
          <ul className={styles.list}>
            <li>포인트는 타인에게 양도할 수 없으며, 현금으로 환불되지 않습니다.</li>
            <li>단, 관련 법령에 따라 환불이 가능한 경우에는 고객센터를 통해 환불 요청이 가능합니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. 부정 이용 및 제재</h2>
          <ul className={styles.list}>
            <li>시스템 취약점 악용, 허위 정보 등록 등을 통한 포인트 획득은 사전 통보 없이 취소 및 계정 정지 등의 제재를 받을 수 있습니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. 기타 사항</h2>
          <ul className={styles.list}>
            <li>포인트 관련 정책은 당사의 운영 방침에 따라 사전 고지 후 변경될 수 있습니다.</li>
            <li>자세한 내용은 고객센터 또는 공지사항을 통해 확인해 주세요.</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 