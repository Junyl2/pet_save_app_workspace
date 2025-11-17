'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import styles from './InputModal.module.css';

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
  inputType?: 'text' | 'textarea';
}

export function InputModal({
  open,
  onClose,
  onConfirm,
  title = '입력',
  message,
  placeholder = '',
  confirmText = '확인',
  cancelText = '취소',
  defaultValue = '',
  inputType = 'text',
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
  }, [open, defaultValue]);

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && inputType === 'text') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title={title}>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        {inputType === 'textarea' ? (
          <textarea
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={4}
          />
        ) : (
          <input
            type="text"
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
          />
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.confirmButton}`}
            onClick={handleConfirm}
            disabled={!value.trim()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

