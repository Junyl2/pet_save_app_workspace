// components/ui/SearchState.tsx
'use client';

import Image from 'next/image';
import styles from './SearchState.module.css';

type SearchStateProps = {
  imageSrc: string;
  altText: string;
  message: string;
  /*  actionButton?: React.ReactNode;  */
};

export default function SearchState({
  imageSrc,
  altText,
  message,
}: /*  actionButton, */
SearchStateProps) {
  return (
    <div className={styles.emptyContainer}>
      <div>
        <Image
          src={imageSrc}
          alt={altText}
          width={100}
          height={100}
          className="object-contain"
        />
        <p className={styles.emptyText}>{message}</p>
        {/*      {actionButton && <div className={styles.action}>{actionButton}</div>} */}
      </div>
    </div>
  );
}
