"use client";

import Dropdown from "../../ui/Dropdown/Dropdown";
import DateRange from "../../ui/DateRange/DateRange";
import styles from "./FilterBar.module.css";

export default function FilterBar() {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <Dropdown
          options={["1개월", "3개월", "6개월", "1년", "전체보기"]}
          defaultValue="3개월"
        />
        <Dropdown
          options={[
            "상품 준비중",
            "배송중",
            "배송완료",
            "픽업중",
            "픽업완료",
            "전체보기",
          ]}
          defaultValue="전체보기"
        />
      </div>
      <DateRange start="2025.05.15" end="2025.07.28" />
    </div>
  );
}
