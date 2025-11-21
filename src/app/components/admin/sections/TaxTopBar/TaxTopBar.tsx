'use client';

import styles from './TaxTopBar.module.css';

export default function TaxTopBar() {
  return (
    <header className={styles.wrap}>
      <h1 className={styles.title}>세금 계산서 리스트</h1>
    </header>
  );
}
