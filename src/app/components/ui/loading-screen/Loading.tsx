import styles from './Loading.module.css';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.loadingScreen}>
        <Image
          src="/images/logo/loading-screen.png"
          priority
          alt="Loading..."
          width={254}
          height={153}
          className={styles.pulse}
        />
      </div>
    </div>
  );
}
