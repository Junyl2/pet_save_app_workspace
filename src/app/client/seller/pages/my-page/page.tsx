import ProfileMenu from '@/app/components/pages/my-page/ProfileMenu/ProfileMenu';
import styles from './styles.module.css';
export default function MyPage() {
  return (
    <div className={styles.container}>
      <ProfileMenu />
    </div>
  );
}
