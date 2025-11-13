'use client';
import styles from '../ExchangePage.module.css';
interface SubmitButtonStepProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export function SubmitButtonStep({
  onSubmit,
  disabled = false,
}: SubmitButtonStepProps) {
  return (
    <div className={styles.submitContainer}>
      <button
        onClick={onSubmit}
        className={styles.submitButton}
        disabled={disabled}
      >
        교환신청
      </button>
    </div>
  );
}
