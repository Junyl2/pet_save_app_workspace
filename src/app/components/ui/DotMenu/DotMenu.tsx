'use client';
import styles from './DotMenu.module.css';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { DeleteModal } from '../modal/DeleteModal/DeleteModal';
import ReportModal from '../modal/ReportModal/ReportModal';

interface DotMenuProps {
  mode?: 'default' | 'deleteOnly' | 'deletePage';
  onDelete?: () => void; // new callback
  storeId?: string;
  storeName?: string;
}

export const DotMenu = ({
  mode = 'default',
  onDelete,
  storeId,
  storeName,
}: DotMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  /* const router = useRouter(); */
  const pathname = usePathname();

  const isContactUs = pathname.startsWith('/contact-us');

  const handleDelete = () => {
    setMenuOpen(false);
    if (onDelete) {
      onDelete(); // trigger passed callback
    } /*  else {
      router.push('/delete');
    } */
  };

  const handlDeleteModal = () => {
    setDeleteModalOpen(true);
    setMenuOpen(false);
  };

  const handleReport = () => {
    setReportModalOpen(true);
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
              <button className={styles.onReportButton} onClick={handleReport}>
                신고하기
              </button>
              <div className={styles.separator}></div>
              <button className={styles.onReportButton}>차단하기</button>
            </>
          )}
        </div>
      )}

      {deleteModalOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteModal
            modalTitle="이 글을 삭제하시겠습니까?"
            open={true}
            onDelete={handleDelete}
            onClose={() => setDeleteModalOpen(false)}
          />
        </div>
      )}

      {reportModalOpen && (
        <ReportModal
          show={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          storeId={storeId}
          storeName={storeName}
        />
      )}
    </div>
  );
};
