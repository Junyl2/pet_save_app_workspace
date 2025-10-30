'use client';

import Dropdown from '../../ui/Dropdown/Dropdown';
import DateRange from '../../ui/DateRange/DateRange';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
}

export default function FilterBar({
  selectedPeriod,
  onPeriodChange,
  selectedStatus,
  onStatusChange,
}: FilterBarProps) {
  // use exact display strings from your statusMap
  const periodOptions = ['1개월', '3개월', '6개월', '1년', '전체보기'];

  const statusOptions = [
    '상품 준비중', // PREPARING
    '배송중', // DELIVERY_STARTED
    '픽업 준비완료',
    /*     '픽업중', */ // PICKUP_IN_PROGRESS
    '픽업 완료', // PICKUP_COMPLETED
    '배송완료', // COMPLETED
    '전체보기',
  ];

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <Dropdown
          options={periodOptions}
          defaultValue={selectedPeriod}
          onChange={onPeriodChange}
        />
        <Dropdown
          options={statusOptions}
          defaultValue={selectedStatus}
          onChange={onStatusChange}
        />
      </div>
      <DateRange start="2025.05.15" end="2025.07.28" />
    </div>
  );
}
