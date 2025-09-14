"use client";
import React, { ReactNode } from "react";
import styles from "./ProductSection.module.css";

interface SectionProps {
  leftContent?: ReactNode; // e.g., checkbox
  mainContent: ReactNode; // product details or anything
  className?: string;
}

export default function ProductSection({
  leftContent,
  mainContent,
  className,
}: SectionProps) {
  return (
    <div className={`${className ?? ""} ${styles.section}`}>
      {leftContent && <div className={styles.leftContent}>{leftContent}</div>}
      <div className={styles.mainContent}>{mainContent}</div>
    </div>
  );
}
