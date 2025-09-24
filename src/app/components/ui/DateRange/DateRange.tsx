"use client";

import React from "react";
import styles from "./DateRange.module.css";

interface DateRangeProps {
  start: string; // e.g. "2025.05.15"
  end: string; // e.g. "2025.07.28"
}

export default function DateRange({ start, end }: DateRangeProps) {
  return (
    <div className={styles.range}>
      {start} ~ {end}
    </div>
  );
}
