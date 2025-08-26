'use client';
import styles from './UsageInstructions.module.css';

export const UsageInstructions = () => {
  return (
    <section className={styles.section}>
      <h3>이용 안내</h3>

      <p>
        <strong>&lt;수령 방법 안내&gt;</strong>
        <br />본 상품은 [택배 배송] 또는 [직접 픽업] 중 선택 가능합니다. 결제
        단계에서 수령 방식을 선택해 주세요.
      </p>

      <p>
        <strong>&lt;배송 안내&gt;</strong>
      </p>
      <ul>
        <li>배송비: 3,000원 (30,000원 이상 구매 시 무료)</li>
        <li>배송 기간: 결제일로부터 2~3일 내 출고</li>
        <li>제주/도서산간 지역은 추가 배송비가 발생할 수 있습니다.</li>
      </ul>

      <p>
        <strong>&lt;픽업 안내&gt;</strong>
      </p>
      <ul>
        <li>픽업 장소: 서울특별시 중구 양심대로 407 5층</li>
        <li>운영시간: 평일 10:00 ~ 18:00</li>
        <li>결제 후 5일 이내 방문해 주세요.</li>
      </ul>

      <p>
        <strong>&lt;교환/반품 안내&gt;</strong>
      </p>
      <ul>
        <li>
          상품 수령 후 7일 이내 불량 또는 오배송에 한해 교환/환불 가능합니다.
        </li>
        <li>단순 변심 및 포장 훼손 시 교환/환불 불가합니다.</li>
        <div className={styles.noBulletWrapper}>
          <li className={styles.noBullet}>
            ※ 택배 배송의 경우, 반품 시 왕복 배송비가 부과될 수 있습니다.
          </li>
          <li className={styles.noBullet}>
            ※ 픽업의 경우, 수령 매장에 직접 방문하여 접수하셔야 합니다.
          </li>
        </div>
      </ul>
    </section>
  );
};
