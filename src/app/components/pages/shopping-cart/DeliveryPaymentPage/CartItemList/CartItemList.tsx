import { OrderItem } from '../DeliveryPaymentPage';
import styles from './CartItemList.module.css';

interface CartItemListProps {
  orderItems: OrderItem[];
}

export default function CartItemList({ orderItems }: CartItemListProps) {
  return (
    <div className={styles.grid}>
      {orderItems.map(({ product, quantity }) => (
        <div key={product.id} className={styles.card}>
          <div className={styles.imageWrapper}>
            <img
              src={product.image ?? '/images/products/product-fallback.svg'}
              alt={product.name}
              className={styles.cartImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const fallbackPath = '/images/products/product-fallback.svg';
                if (!target.src.includes('product-fallback.svg')) {
                  target.src = fallbackPath;
                }
              }}
            />
          </div>
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
