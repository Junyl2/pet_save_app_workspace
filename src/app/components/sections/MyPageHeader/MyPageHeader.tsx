'use client';
import { FaChevronLeft } from 'react-icons/fa';
import styles from './MyPageHeader.module.css';
import { useRouter } from 'next/navigation';
import { TopIcons } from '@/app/components/ui/TopIcons/TopIcons';

interface MyPageHeaderProps {
  title?: string;
  showTitle?: boolean;
  onBack?: () => void;
}

export const MyPageHeader = ({ title, showTitle = false, onBack }: MyPageHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={styles.header}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={handleBack}>
        <FaChevronLeft className={styles.backIcon} />
      </button>

      {/* Title (optional) */}
      {showTitle && title && (
        <h1 className={styles.title}>{title}</h1>
      )}

      {/* Top Icons */}
      <TopIcons />
    </div>
  );
}; 