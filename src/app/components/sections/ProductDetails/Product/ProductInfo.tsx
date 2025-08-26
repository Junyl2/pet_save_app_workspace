'use client';
import styles from './ProductInfo.module.css';

interface ProductInfoProps {
  name: string;
  expiration: string;
  price: string;
  discountPrice?: string;
  details?: string[];
}

export const ProductInfo = ({
  name,
  expiration,
  price,
  discountPrice,
  details,
}: ProductInfoProps) => {
  return (
    <div className={styles.info}>
      <div className={styles.productWrapper}>
        <div className={styles.productInfo}>
          <h1 className={styles.name}>{name}</h1>
          <p className={styles.expiration}>유통기한: {expiration}</p>
        </div>

        <p className={styles.price}>
          {discountPrice ? (
            <span className={styles.discountWrapper}>
              <span className={styles.original}>{price}</span>
              <span className={styles.discount}>{discountPrice}</span>
            </span>
          ) : (
            price
          )}
        </p>
      </div>

      {details && details.length > 0 && (
        <section className={styles.section}>
          <h3>상품 상세내용</h3>
          {details.map((detail, idx) => (
            <p key={idx}>{detail}</p>
          ))}
        </section>
      )}
    </div>
  );
};
