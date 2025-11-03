import styles from '../DeliveryPayment.module.css';
import points from './PointsDiscout.module.css';

interface PointsDiscountProps {
  usePoints: number;
  setUsePoints: (value: number) => void;
  maxPointUsable: number;
  pointsAvailable: number;
  pointsBalance: number;
}

export default function PointsDiscount({
  usePoints,
  setUsePoints,
  maxPointUsable,
  pointsAvailable,
  pointsBalance,
}: PointsDiscountProps) {
  const handleUseAllPoints = () => {
    if (pointsAvailable === 0) return;
    setUsePoints(maxPointUsable);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = Math.floor(
      Number(e.target.value.replace(/\D/g, '')) || 0
    );

    // Enforce bounds and prevent using more than available
    if (numericValue > maxPointUsable) {
      setUsePoints(maxPointUsable);
    } else if (numericValue < 0) {
      setUsePoints(0);
    } else {
      setUsePoints(numericValue);
    }
  };

  return (
    <section className={styles.card}>
      <h3 className={styles.sectionTitle}>포인트 할인</h3>
      <div className={styles.fieldRow}>
        <div className={points.inputWrapper}>
          <span className={points.leftLabel}>포인트</span>
          <input
            id="points"
            className={points.pointsInput}
            type="text"
            inputMode="numeric"
            value={usePoints || ''}
            onChange={handleInputChange}
            placeholder="0"
          />
          <span className={points.rightLabel}>
            {usePoints.toLocaleString()}원
          </span>
        </div>
        <div>
          <button
            type="button"
            className={points.secondaryBtn}
            onClick={handleUseAllPoints}
            disabled={pointsAvailable <= 0}
          >
            모두 사용
          </button>
        </div>
      </div>
      <p className={styles.pointsHint}>
        사용 가능: {pointsAvailable.toLocaleString()}원
        <span className="text-muted">
          {' '}
          | 보유 포인트: {pointsBalance.toLocaleString()}원
        </span>
      </p>
    </section>
  );
}
