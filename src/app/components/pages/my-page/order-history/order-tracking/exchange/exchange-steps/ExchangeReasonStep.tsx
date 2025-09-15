"use client";
import styles from "../ExchangePage.module.css";

interface ExchangeReasonStepProps {
  selectedReason: string;
  onReasonChange: (reason: string) => void;
  reasons: string[];
}

export function ExchangeReasonStep({
  selectedReason,
  onReasonChange,
  reasons,
}: ExchangeReasonStepProps) {
  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>교환사유 선택</h3>
      <div className={styles.selectWrapper}>
        <select
          value={selectedReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className={styles.select}
        >
          <option value="">불량</option>
          {reasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}