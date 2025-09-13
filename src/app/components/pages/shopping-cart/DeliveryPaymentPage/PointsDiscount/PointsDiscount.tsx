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
  const handleUseAllPoints = () => setUsePoints(maxPointUsable);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = Math.max(
      0,
      Math.floor(Number(e.target.value.replace(/\D/g, '')) || 0)
    );
    setUsePoints(numericValue);
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
            value={usePoints || ''}
            onChange={handleInputChange}
            placeholder=""
          />
          <span className={points.rightLabel}>
            {usePoints.toLocaleString()}원
          </span>
        </div>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={handleUseAllPoints}
        >
          모두 사용
        </button>
      </div>
      <p className={styles.pointsHint}>
        사용 가능: {pointsAvailable.toLocaleString()}원 | 보유 포인트:{' '}
        {pointsBalance.toLocaleString()}원
      </p>
    </section>
  );
}
