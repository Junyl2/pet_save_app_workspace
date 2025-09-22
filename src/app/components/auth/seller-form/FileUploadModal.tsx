'use client';
import { useState, useEffect } from 'react';
import styles from './FileUploadModal.module.css';
import Image from 'next/image';
import { FileUploadService } from '@/app/api/services/client/fileService/fileUploadService';

interface FileUploadModalProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onFileUploaded?: (fileId: string, encryptedId: string) => void;
}

export default function FileUploadModal({
  file,
  setFile,
  onFileUploaded,
}: FileUploadModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(file);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

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
    if (tempFile) {
      if (tempFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(tempFile);
        setPreviewURL(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } else if (tempFile.type === 'application/pdf') {
        // For PDF files, we'll show a PDF icon with the filename
        setPreviewURL('pdf-preview');
      } else {
        setPreviewURL(null);
      }
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
    setUploadSuccess(null);

    try {
      console.log('Uploading file:', tempFile.name);
      const result = await FileUploadService.uploadFile(tempFile);

      if (result.error) {
        console.error('File upload failed:', result.error);
        setUploadError(result.error);
        return;
      }

      if (result.data) {
        console.log('File uploaded successfully:', result.data);
        setFile(tempFile); // commit temporary file to parent state

        // Notify parent component with file IDs
        if (onFileUploaded) {
          onFileUploaded(result.data.fileId, result.data.encryptedId);
        }

        setUploadSuccess('파일이 성공적으로 업로드되었습니다.');
        setIsModalOpen(false); // close modal

        // Clear success message after 2 seconds
        setTimeout(() => setUploadSuccess(null), 2000);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError('파일 업로드 중 오류가 발생했습니다.');
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
              {previewURL === 'pdf-preview' && tempFile ? (
                <div className={styles.pdfPreview}>
                  <div className={styles.pdfIcon}>
                    <Image
                      src="/images/icons/mypage-note.svg"
                      alt="PDF Icon"
                      height={60}
                      width={60}
                      className="object-contain"
                    />
                  </div>
                  <div className={styles.pdfInfo}>
                    <h3 className={styles.pdfTitle}>PDF 파일</h3>
                    <p className={styles.pdfFileName}>{tempFile.name}</p>
                    <p className={styles.pdfFileSize}>
                      {(tempFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className={styles.pdfType}>문서 파일</p>
                  </div>
                </div>
              ) : previewURL && previewURL !== 'pdf-preview' ? (
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

            <button
              className={styles.modalButton}
              onClick={handleConfirm}
              disabled={!tempFile || isUploading}
            >
              {isUploading ? '업로드 중...' : '완료'}
            </button>

            {/* Upload Status Messages */}
            {uploadError && (
              <div className={styles.errorMessage}>
                <p>{uploadError}</p>
              </div>
            )}
            {uploadSuccess && (
              <div className={styles.successMessage}>
                <p>{uploadSuccess}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
