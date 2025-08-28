'use client';
import styles from './DotMenu.module.css';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useState } from 'react';
import ReportModal from '../modal/ReportModal/ReportModal';
export const DotMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      {/* Horizontal three-dot menu */}
      <div className={styles.menuWrapper}>
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.dropdown}>
          <button
            onClick={() => {
              setMenuOpen(false);
              setReportOpen(true);
            }}
            className={styles.onReportButton}
          >
            신고하기
          </button>
          <div className={styles.separator}></div>
          <button
            onClick={() => {
              setMenuOpen(false);
              alert('차단하기 기능은 아직 준비 중입니다.');
            }}
            className={styles.onReportButton}
          >
            차단하기
          </button>
        </div>
      )}
      {/* report modal */}
      <ReportModal show={reportOpen} onClose={() => setReportOpen(false)} />
    </>
  );
};
