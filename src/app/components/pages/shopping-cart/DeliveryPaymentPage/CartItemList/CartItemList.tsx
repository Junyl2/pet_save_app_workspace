import { OrderItem } from '../DeliveryPaymentPage';
import styles from '../DeliveryPayment.module.css';

interface CartItemListProps {
  orderItems: OrderItem[];
}

export default function CartItemList({ orderItems }: CartItemListProps) {
  return (
    <div className={styles.cartList}>
      {orderItems.map(({ product, quantity }) => (
        <div key={product.id} className={styles.cartItem}>
          <img
            src={product.image ?? '/placeholder.png'}
            alt={product.name}
            className={styles.cartImage}
          />
          <div className={styles.cartDetails}>
            <p className={styles.cartName}>{product.name}</p>
            <p className={styles.cartPrice}>
              {product.discountPrice ? (
                <>
                  <span className={styles.originalPrice}>
                    {product.price.toLocaleString()}원
                  </span>{' '}
                  <span className={styles.discountPrice}>
                    {product.discountPrice.toLocaleString()}원
                  </span>
                </>
              ) : (
                `${product.price.toLocaleString()}원`
              )}
            </p>
            {product.brand && (
              <p className={styles.cartBrand}>{product.brand}</p>
            )}
            <p className={styles.cartQuantity}>수량: {quantity}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
