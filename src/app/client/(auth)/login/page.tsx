'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add login logic (call API)
    console.log({ username, password, remember });
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.imageWrapper}>
        <Image
          src="/loading-screen.png"
          alt="Pet Saves"
          height={94}
          width={144}
          className={styles.objectContain}
        />
      </div>

      <div className={styles.loginFormContainer}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <input
            id="username"
            type="text"
            className={styles.inputField}
            placeholder="아이디를 입력하세요."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            id="password"
            type="password"
            className={styles.inputField}
            placeholder="비밀번호를 입력하세요."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className={styles.rememberLogin}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />{' '}
              아이디 저장
            </label>
          </div>

          <button type="submit" className={styles.loginButton}>
            로그인
          </button>
        </form>
        {/* links */}
        <div className={styles.loginLinks}>
          <span className={styles.linkItem}>
            <a href="#">아이디 찾기</a>
          </span>
          <div className={styles.divider}> | </div>
          <span className={styles.linkItem}>
            <a href="#">비밀번호 재설정</a>
          </span>
          <div className={styles.divider}> | </div>

          <span className={styles.linkItem}>
            <a href="#">회원가입</a>
          </span>
        </div>
      </div>
      {/* logo */}
      <div className={styles.logoWrapper}>
        <Image
          src="/loading-screen.png"
          alt="Pet Saves"
          height={50}
          width={50}
          className={styles.logo}
        />
        <Image
          src="/loading-screen.png"
          alt="Pet Saves"
          height={50}
          width={50}
          className={styles.logo}
        />
        <Image
          src="/loading-screen.png"
          alt="Pet Saves"
          height={50}
          width={50}
          className={styles.logo}
        />
      </div>
    </div>
  );
}
