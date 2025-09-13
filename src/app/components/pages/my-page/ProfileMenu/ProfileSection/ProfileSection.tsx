import React from 'react';
import styles from './ProfileSection.module.css';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const ProfileSection = ({ title, children }: Props) => {
  return (
    <div className={styles.profileSection}>
      {title && <h3 className={styles.sectionTitle}>{title}</h3>}
      <div className={styles.sectionItems}>{children}</div>
    </div>
  );
};

export default ProfileSection;
