'use client';
import styles from './ProductInfo.module.css';

interface ProductInfoProps {
  name: string;
  expiration: string;
  price: number;
  discountPrice?: number;
  details?: string[];
  category?: string[];
  quantity?: number;
  averageRating?: number;
  totalReviews?: number;
}

export const ProductInfo = ({
  name,
  expiration,
  price,
  discountPrice,
  details,
}: /* category, */
/*   quantity, */
/*   averageRating,
  totalReviews, */
ProductInfoProps) => {
  return (
    <div className={styles.info}>
      <div className={styles.productInfoWrapper}>
        <div className={styles.productWrapper}>
          <div className={styles.productInfo}>
            <h1 className={styles.name}>{name}</h1>
            {/*  {category && category.length > 0 && (
            <p className={styles.category}>카테고리: {category.join(', ')}</p>
          )} */}
            {/*   {quantity !== undefined && (
            <p className={styles.quantity}>재고: {quantity}개</p>
          )} */}
            <p className={styles.expiration}>
              {new Date(expiration).toLocaleDateString('ko-KR')} 까지
            </p>
            {/*   {averageRating !== undefined && totalReviews !== undefined && (
            <p className={styles.rating}>
              평점: {averageRating.toFixed(1)} ({totalReviews}개 리뷰)
            </p>
          )} */}
          </div>

          <p className={styles.price}>
            {discountPrice && discountPrice !== price ? (
              <span className={styles.discountWrapper}>
                <span className={styles.original}>
                  {price.toLocaleString('ko-KR')}원
                </span>
                <span className={styles.discount}>
                  {discountPrice.toLocaleString('ko-KR')}원
                </span>
              </span>
            ) : (
              `${price.toLocaleString('ko-KR')}원`
            )}
          </p>
        </div>
      </div>

      {details && details.length > 0 && (
        <section className={styles.section}>
          <h3>상품 상세내용</h3>
          {details.map((detail, idx) => (
            <p className={styles.detail} key={idx}>
              {detail}
            </p>
          ))}
        </section>
      )}
    </div>
  );
};
