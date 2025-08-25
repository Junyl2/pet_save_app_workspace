'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, remember }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      console.log('Login success:', data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Top Image */}
      <div className={styles.imageWrapper}>
        <Image
          src="/loading-screen.png"
          alt="Pet Saves"
          height={94}
          width={144}
          className={styles.objectContain}
        />
      </div>

      {/* Form */}
      <div className={styles.loginFormContainer}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="username"
              autoComplete="username"
              className={styles.inputField}
              placeholder="아이디를 입력하세요."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              className={styles.inputField}
              placeholder="비밀번호를 입력하세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

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

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* Links */}
        <div className={styles.loginLinks}>
          <span className={styles.linkItem}>
            <Link href="/client/find-id" scroll={true}>
              아이디 찾기
            </Link>
          </span>
          <div className={styles.divider}> | </div>
          <span className={styles.linkItem}>
            <Link href="/client/reset-password" scroll={true}>
              비밀번호 재설정
            </Link>
          </span>
          <div className={styles.divider}> | </div>
          <span className={styles.linkItem}>
            <Link href="/client/join-membership" scroll={true}>
              회원가입
            </Link>
          </span>
        </div>
      </div>

      {/* Logos */}
      <div className={styles.logoWrapper}>
        <Image
          src="/images/icons/n.png"
          alt="N"
          height={50}
          width={50}
          className={styles.logo}
        />
        <Image
          src="/images/icons/kakao.png"
          alt="Kakao Talk"
          height={50}
          width={50}
          className={styles.logo}
        />
        <Image
          src="/images/icons/apple.png"
          alt="Apple Logo"
          height={50}
          width={50}
          className={styles.logo}
        />
      </div>
    </div>
  );
}
