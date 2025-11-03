'use client';

import styles from '../ReturnPage.module.css';

interface ReturnMethodStepProps {
  isDeliveryOrder: boolean;
  returnMethod?: string;
  onMethodChange: (method: string) => void;
}

export function ReturnMethodStep({
  isDeliveryOrder,
  returnMethod,
  onMethodChange,
}: ReturnMethodStepProps) {
  if (isDeliveryOrder) {
    return (
      <div className={styles.stepContent}>
        <h2 className={styles.stepTitle}>수거방법</h2>

        <div className={styles.courierInfo}>
          <h3>CJ대한통운이 수거를 방문합니다</h3>
          <p>수거는 신청 후 2-3일 내 진행됩니다</p>
        </div>

        <div className={styles.methodOptions}>
          <label className={styles.methodOption}>
            <input
              type="radio"
              name="returnMethod"
              value="pickup"
              checked={returnMethod === 'pickup'}
              onChange={(e) => onMethodChange(e.target.value)}
              className={styles.radio}
            />
            수거하러 와주세요
          </label>

          <label className={styles.methodOption}>
            <input
              type="radio"
              name="returnMethod"
              value="direct"
              checked={returnMethod === 'direct'}
              onChange={(e) => onMethodChange(e.target.value)}
              className={styles.radio}
            />
            직접 보낼게요
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>직접반품</h2>

      <div className={styles.warningBox}>
        <div className={styles.warningContent}>
          <div className={styles.headerWrapper}>
            <div className={styles.warningIcon}>⚠️</div>
            <p>
              <strong>
                픽업 주문 상품은 반드시 주문 매장에서 직접 교환·환불해야 합니다.
              </strong>
            </p>
          </div>

          <ul>
            <li>택배 교환/반품 불가</li>
            <li>영수증과 미개봉 상품을 지참해 주세요</li>
            <li>매장 운영시간 내 방문 부탁합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
