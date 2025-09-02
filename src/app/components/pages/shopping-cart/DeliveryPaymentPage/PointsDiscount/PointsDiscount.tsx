import styles from '../DeliveryPayment.module.css';

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

  return (
    <section className={styles.card}>
      <h3 className={styles.sectionTitle}>포인트 할인</h3>
      <div className={styles.fieldRow}>
        <label className={styles.label} htmlFor="points">
          포인트
        </label>
        <div className={styles.pointsRow}>
          <input
            id="points"
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={usePoints}
            onChange={(e) =>
              setUsePoints(Math.max(0, Math.floor(Number(e.target.value) || 0)))
            }
            placeholder="0원"
          />
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleUseAllPoints}
          >
            모두 사용
          </button>
        </div>
      </div>
      <p className={styles.pointsHint}>
        사용 가능: {pointsAvailable.toLocaleString()}원 | 보유 포인트:{' '}
        {pointsBalance.toLocaleString()}원
      </p>
    </section>
  );
}
