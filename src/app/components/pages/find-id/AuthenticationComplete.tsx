'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import styles from './AuthenticationComplete.module.css';

interface AuthenticationCompleteProps {
  name: string;
  email: string;
}

export default function AuthenticationComplete({
  name,
  email,
}: AuthenticationCompleteProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <FaArrowLeft className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>아이디 찾기</h1>
      </div>

      {/* Form Body */}
      <div className={styles.inputContainer}>
        <div className={styles.inputGroup}>
          <label>이름</label>
          <input type="text" value={name} readOnly />
        </div>

        <div className={styles.inputGroup}>
          <label>이메일</label>
          <input type="text" value={email} readOnly />
        </div>
      </div>

      {/* Confirm Button */}
      <button
        className={styles.modalButton}
        onClick={() => setShowModal(true)} // 👈 open modal instead of router.push
      >
        아이디 확인
      </button>

      {/* Success Modal */}
      <BaseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="아이디 찾기"
      >
        <p className={styles.successMessage}>
          사용하시는 아이디를
          <br />
          이메일로 전송해드렸습니다
        </p>
        <button
          className={styles.modalButton}
          onClick={() => {
            setShowModal(false);
            router.push('/client/login');
          }}
        >
          확인
        </button>
      </BaseModal>
    </div>
  );
}
