'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import styles from './ProfileItem.module.css';

type Props = {
  label: string;
  route?: string; // make optional
  onClick?: () => void; // new optional handler
  showChevron?: boolean;
};

const ProfileItem = ({ label, route, onClick, showChevron = true }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(); // run custom handler (e.g., logout modal)
    } else if (route) {
      router.push(route);
    }
  };

  return (
    <button className={styles.profileItem} onClick={handleClick}>
      <span className={styles.label}>{label}</span>
      {showChevron && <FaChevronRight className={styles.icon} />}
    </button>
  );
};

export default ProfileItem;
