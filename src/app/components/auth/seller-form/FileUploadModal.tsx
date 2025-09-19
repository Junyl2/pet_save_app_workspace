'use client';
import { useState, useEffect } from 'react';
import styles from './FileUploadModal.module.css';
import Image from 'next/image';
import { FileUploadService } from '@/app/api/services/fileUploadService';

interface FileUploadModalProps {
  file: File | null;
  setFile: (file: File | null) => void;
  fileId?: string | null;
  setFileId?: (fileId: string | null) => void;
}

export default function FileUploadModal({
  file,
  setFile,
  fileId,
  setFileId,
}: FileUploadModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(file);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleConfirm = async () => {
    if (!tempFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('Uploading file:', tempFile.name);

      const result = await FileUploadService.uploadFile(tempFile);

      if (result.error) {
        console.error('File upload failed:', result.error);

        // Check if it's a server error (500) - show clear error message
        if (
          result.error.includes('500') ||
          result.error.includes('Internal Server Error') ||
          result.error.includes('서버 내부 오류')
        ) {
          console.log('Server error - file upload failed');
          setUploadError(
            '파일 업로드 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          );
          setIsUploading(false);
          return;
        }

        setUploadError(result.error);
        setIsUploading(false);
        return;
      }

      if (result.data) {
        console.log('File uploaded successfully, file ID:', result.data);
        setFile(tempFile); // commit temporary file to parent state
        if (setFileId) {
          setFileId(result.data); // set the file ID
        }
        setIsModalOpen(false); // close modal
      } else {
        setUploadError('Failed to get file ID from server');
      }
    } catch (error) {
      console.error('File upload error:', error);
      // For network/server errors, show clear error message
      console.log('Network/server error - file upload failed');
      setUploadError(
        '파일 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsUploading(false);
    }
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

            {uploadError && (
              <div
                style={{
                  color: 'red',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                {uploadError}
              </div>
            )}
            <button
              className={styles.modalButton}
              onClick={handleConfirm}
              disabled={!tempFile || isUploading}
            >
              {isUploading ? '업로드 중...' : '완료'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
