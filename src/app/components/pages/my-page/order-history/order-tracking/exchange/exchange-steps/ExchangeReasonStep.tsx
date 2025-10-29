'use client';
import styles from '../ExchangePage.module.css';

interface ExchangeReasonStepProps {
  selectedReason: string;
  onReasonChange: (reason: string) => void;
  reasons: string[];
  label?: string;
}

export function ExchangeReasonStep({
  selectedReason,
  onReasonChange,
  reasons,
  label = '교환사유 선택',
}: ExchangeReasonStepProps) {
  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>{label}</h3>
      <div className={styles.selectWrapper}>
        <select
          value={selectedReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className={styles.select}
        >
          <option value="">교환 사유를 선택해주세요</option>
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
