'use client';
import { motion } from 'framer-motion';
import styles from './Loading.module.css';

export default function Loading() {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <motion.div
          className={styles.loader}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
        <motion.p
          className={styles.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          로딩 중...
        </motion.p>
      </div>
    </div>
  );
}
