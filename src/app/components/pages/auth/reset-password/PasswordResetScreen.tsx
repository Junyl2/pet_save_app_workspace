'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';
import styles from './PasswordResetScreen.module.css';
import ResetPassword from './ResetPassword';

interface PasswordResetScreenProps {
  name: string;
  userId: string;

  email: string;
}

export default function PasswordResetScreen({
  name,
  userId,
  email,
}: PasswordResetScreenProps) {
  const router = useRouter();
  /*  const [showModal, setShowModal] = useState(false); */
  const [showComplete, setShowComplete] = useState(false);

  const handleNext = () => {
    /*   setShowModal(true); */
    setShowComplete(true);
  };

  if (showComplete) {
    return <ResetPassword />;
  }
  return (
    <>
      {/* Header */}

      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <FaChevronLeft className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>비밀번호 찾기</h1>
      </div>

      <div className={styles.container}>
        {/* Form Body */}
        <div className={styles.inputContainer}>
          <div className={styles.inputGroup}>
            <label>이름</label>
            <input type="text" value={name} readOnly />
          </div>
          <div className={styles.inputGroup}>
            <label>아이디</label>
            <input type="text" value={userId} readOnly />
          </div>

          <div className={styles.inputGroup}>
            <label>이메일</label>
            <input type="text" value={email} readOnly />
          </div>
        </div>

        {/* Confirm Button */}
        <button className={styles.modalButton} onClick={handleNext}>
          다음
        </button>

        {/* Success Modal */}
        {/*   <BaseModal
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
            다음
          </button>
        </BaseModal> */}
      </div>
    </>
  );
}
