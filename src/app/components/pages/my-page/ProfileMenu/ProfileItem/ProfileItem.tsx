'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import styles from './ProfileItem.module.css';

type Props = {
  label: string;
  route: string;
  showChevron?: boolean; // new prop
};

const ProfileItem = ({ label, route, showChevron = true }: Props) => {
  const router = useRouter();

  return (
    <button className={styles.profileItem} onClick={() => router.push(route)}>
      <span className={styles.label}>{label}</span>
      {showChevron && <FaChevronRight className={styles.icon} />}
    </button>
  );
};

export default ProfileItem;
