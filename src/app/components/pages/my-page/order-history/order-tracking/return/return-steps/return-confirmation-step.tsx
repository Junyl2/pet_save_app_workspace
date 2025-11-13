import type { Product } from '@/app/components/types/order';
import { calculateRefundAmount } from '@/app/utils/refund-calculations';
import styles from './return-confirmation-step.module.css';

interface RefundConfirmationStepProps {
  selectedProducts: Product[];
  isDeliveryOrder: boolean;
}

export function ReturnConfirmationStep({
  selectedProducts,
  isDeliveryOrder,
}: RefundConfirmationStepProps) {
  const { subtotal, deliveryFee, discount, returnFee, total } =
    calculateRefundAmount(selectedProducts, isDeliveryOrder);

  return (
    <div className={styles.container}>
      {/* Title Section */}
      <div className={styles.titleSection}>
        <h2 className={styles.stepTitle}>
          환불 상품 {selectedProducts.length}개
        </h2>
      </div>

      {/* Product Sections - Each product in its own section */}
      {selectedProducts.map((product) => (
        <div key={product.id} className={styles.productSection}>
          <div className={styles.productInfo}>
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <h3 className={styles.productName}>{product.name}</h3>
              <div className={styles.priceContainer}>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
                <span className={styles.currentPrice}>
                  {product.price.toLocaleString()}원
                </span>
              </div>
              <span className={styles.brand}>{product.brand}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Refund Breakdown Section */}
      <div className={styles.refundBreakdownSection}>
        <div className={styles.refundBreakdown}>
          <h3>예상 환불 금액</h3>
          <hr className={styles.divider} />

          <div className={styles.breakdownItem}>
            <span>상품 금액 합계</span>
            <span>{subtotal.toLocaleString()}원</span>
          </div>

          <div className={styles.breakdownItem}>
            <span>배송 금액</span>
            <span>{deliveryFee.toLocaleString()}원</span>
          </div>

          <div className={styles.breakdownItem}>
            <span>쿠폰 할인</span>
            <span>-{discount}원</span>
          </div>

          <div className={styles.breakdownItem}>
            <span>포인트 사용</span>
            <span>-{discount}원</span>
          </div>

          <div className={styles.breakdownItem}>
            <span>반품 비용 차감</span>
            <span>-{returnFee.toLocaleString()}원</span>
          </div>

          <div className={styles.breakdownItem}>
            <span>환불 금액</span>
            <span>{total.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    </div>
  );
}
