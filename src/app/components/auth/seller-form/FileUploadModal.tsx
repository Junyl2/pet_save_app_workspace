'use client';
import { useState, useEffect } from 'react';
import styles from './FileUploadModal.module.css';
import Image from 'next/image';

interface FileUploadModalProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export default function FileUploadModal({
  file,
  setFile,
}: FileUploadModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(file);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Generate preview URL when tempFile changes
  useEffect(() => {
    if (tempFile && tempFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(tempFile);
      setPreviewURL(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewURL(null);
    }
  }, [tempFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTempFile(e.target.files[0]); // update only temporary state
    }
  };

  const handleConfirm = () => {
    setFile(tempFile); // commit temporary file to parent state
    setIsModalOpen(false); // close modal
  };

  const closeModal = () => {
    setTempFile(file); // reset temporary file when closing without confirm
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Input-like display */}
      <div className={styles.customFileInput}>
        <span className={styles.fileName}>
          {file ? file.name : '파일 선택'}
        </span>
        <button
          type="button"
          className={styles.chooseButton}
          onClick={() => setIsModalOpen(true)}
        >
          Choose File
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.centerContent}>
              {previewURL ? (
                <img
                  src={previewURL}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '10px',
                  }}
                />
              ) : (
                <>
                  <Image
                    src="/images/icons/upload.svg"
                    alt="Upload Icon"
                    height={75}
                    width={75}
                    className="object-contain"
                  />
                  <h1 className={styles.modalTitle}>업로드할 파일 찾아보기</h1>
                </>
              )}

              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className={styles.hiddenInputModal}
              />
              <button
                className={styles.chooseFileButton}
                onClick={() =>
                  document
                    .querySelector<HTMLInputElement>('input[type="file"]')
                    ?.click()
                }
              >
                파일 열기
              </button>
            </div>

            <button className={styles.modalButton} onClick={handleConfirm}>
              완료
            </button>
          </div>
        </div>
      )}
    </>
  );
}
