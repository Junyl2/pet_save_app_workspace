"use client";
import styles from "../ExchangePage.module.css";

interface ExchangeDetailStepProps {
  selectedDetail: string;
  onDetailChange: (detail: string) => void;
  details: string[];
}

export function ExchangeDetailStep({
  selectedDetail,
  onDetailChange,
  details,
}: ExchangeDetailStepProps) {
  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>사유 선택</h3>
      <div className={styles.selectWrapper}>
        <select
          value={selectedDetail}
          onChange={(e) => onDetailChange(e.target.value)}
          className={styles.select}
        >
          <option value="">교환 사유를 선택해 주세요</option>
          {details.map((detail) => (
            <option key={detail} value={detail}>
              {detail}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
