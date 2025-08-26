'use client';
import Image from 'next/image';
import styles from './ProductImage.module.css';

interface ProductImageProps {
  src: string;
  alt: string;
}

export const ProductImage = ({ src, alt }: ProductImageProps) => {
  return (
    <div className={styles.imageWrapper}>
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'contain' }}
        className={styles.image}
      />
    </div>
  );
};
