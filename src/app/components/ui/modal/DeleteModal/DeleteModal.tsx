import { BaseModal } from '../BaseModal';
import styles from './DeleteModal.module.css';

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  modalTitle: string;
  onDelete?: () => void;
}

export const DeleteModal = ({
  open,
  onClose,
  modalTitle,
  onDelete,
}: DeleteModalProps) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };
  return (
    <>
      <BaseModal open={open} onClose={onClose} title={modalTitle}>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button onClick={handleDelete} className={styles.submitButton}>
            {' '}
            확인
          </button>
        </div>
      </BaseModal>
    </>
  );
};
