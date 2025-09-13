'use client';
import styles from './DotMenu.module.css';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DeleteModal } from '../modal/DeleteModal/DeleteModal';

interface DotMenuProps {
  mode?: 'default' | 'deleteOnly' | 'deletePage';
  onDelete?: () => void; // new callback
}

export const DotMenu = ({ mode = 'default', onDelete }: DotMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isContactUs = pathname.startsWith('/contact-us');

  const handleDelete = () => {
    setMenuOpen(false);
    if (onDelete) {
      onDelete(); // trigger passed callback
    } else {
      router.push('/delete'); // fallback if no callback
    }
  };

  const handlDeleteModal = () => {
    setDeleteModalOpen(true);
    setMenuOpen(false);
  };

  return (
    <div
      className={
        mode === 'deletePage'
          ? styles.deletePage
          : styles.menuWrapper && isContactUs
          ? styles.contactUsWrapper
          : styles.menuWrapper
      }
    >
      <button
        className={styles.menuBtn}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <FiMoreHorizontal size={20} />
      </button>

      {menuOpen && (
        <div className={styles.dropdown}>
          {/* delete buttons */}
          {mode === 'deleteOnly' ? (
            <button className={styles.onReportButton} onClick={handleDelete}>
              삭제하기
            </button>
          ) : mode === 'deletePage' ? (
            <button
              className={styles.onReportButton}
              onClick={handlDeleteModal}
            >
              삭제하기
            </button>
          ) : (
            /* report button */
            <>
              <button className={styles.onReportButton}>신고하기</button>
              <div className={styles.separator}></div>
              <button className={styles.onReportButton}>차단하기</button>
            </>
          )}
        </div>
      )}

      {deleteModalOpen && (
        <DeleteModal
          modalTitle="이 글을 삭제하시겠습니까?"
          open={true}
          onDelete={handleDelete}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};
