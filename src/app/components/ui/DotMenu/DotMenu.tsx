'use client';

import styles from './DotMenu.module.css';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DeleteModal } from '../modal/DeleteModal/DeleteModal';
import ReportModal from '../modal/ReportModal/ReportModal';
import { BlockService } from '@/app/api/services/client/memberService/block/blockService';
import toast from 'react-hot-toast';

interface DotMenuProps {
  mode?: 'default' | 'deleteOnly' | 'deletePage' | 'editOnly' | 'unblockOnly';
  onDelete?: () => void;
  onEdit?: () => void;
  onBlockToggle?: (storeId: string) => void;
  storeId?: string;
  storeName?: string;
}

export const DotMenu = ({
  mode = 'default',
  onDelete,
  onEdit,
  onBlockToggle,
  storeId,
  storeName,
}: DotMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isContactUs = pathname.startsWith('/contact-us');
  const isBlockListPage = pathname.startsWith(
    '/client/pages/my-page/block-list'
  );

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.();
  };

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit?.();
  };

  const handleDeleteModal = () => {
    setDeleteModalOpen(true);
    setMenuOpen(false);
  };

  const handleReport = () => {
    setReportModalOpen(true);
    setMenuOpen(false);
  };

  /** 🔹 Toggle block/unblock a store */
  const handleBlockToggle = async () => {
    if (!storeId) {
      toast.error('가게 정보를 불러올 수 없습니다.');
      return;
    }

    setIsBlocking(true);
    setMenuOpen(false);

    try {
      const res = await BlockService.toggleBlockStore(storeId);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      const isUnblocked =
        res.data?.resultMsg?.includes('unblocked') ||
        res.data?.resultMsg?.includes('해제');

      if (isUnblocked) {
        toast.success('가게 차단을 해제했습니다.');
        onBlockToggle?.(storeId);

        if (isBlockListPage) {
          setTimeout(() => router.refresh(), 200);
        }
      } else {
        toast.success('가게를 차단 처리했습니다.');

        if (!isBlockListPage) {
          setTimeout(() => router.push('/client/pages/homepage'), 500);
        } else {
          setTimeout(() => router.refresh(), 200);
        }
      }
    } catch (err) {
      console.error('[DotMenu] Block toggle failed:', err);
      toast.error('요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsBlocking(false);
    }
  };

  const wrapperClass =
    mode === 'deletePage'
      ? styles.deletePage
      : isContactUs
      ? styles.contactUsWrapper
      : styles.menuWrapper;

  return (
    <div className={wrapperClass}>
      <button
        className={styles.menuBtn}
        onClick={() => setMenuOpen((prev) => !prev)}
        disabled={isBlocking}
        aria-label="더보기 메뉴"
      >
        <FiMoreHorizontal size={20} />
      </button>

      {menuOpen && (
        <div className={styles.dropdown}>
          {mode === 'editOnly' ? (
            <button className={styles.onReportButton} onClick={handleEdit}>
              수정하기
            </button>
          ) : mode === 'deleteOnly' ? (
            <button className={styles.onReportButton} onClick={handleDelete}>
              삭제하기
            </button>
          ) : mode === 'deletePage' ? (
            <button
              className={styles.onReportButton}
              onClick={handleDeleteModal}
            >
              삭제하기
            </button>
          ) : mode === 'unblockOnly' ? (
            <button
              className={styles.onReportButton}
              onClick={handleBlockToggle}
              disabled={isBlocking}
            >
              {isBlocking ? '처리 중...' : '차단 해제하기'}
            </button>
          ) : (
            <>
              <button className={styles.onReportButton} onClick={handleReport}>
                신고하기
              </button>
              <div className={styles.separator}></div>
              <button
                className={styles.onReportButton}
                onClick={handleBlockToggle}
                disabled={isBlocking}
              >
                {isBlocking ? '처리 중...' : '차단하기'}
              </button>
            </>
          )}
        </div>
      )}

      {deleteModalOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteModal
            modalTitle="이 글을 삭제하시겠습니까?"
            open
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
