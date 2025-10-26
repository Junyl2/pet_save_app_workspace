'use client';

import { useEffect, useState, FormEvent } from 'react';
import Image from 'next/image';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './page.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/app/api/services/client/auth/authService';

const DEFAULT_AFTER_LOGIN =
  '/admin/pages/order-delivery-management/waiting-payment';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill username if remembered
  useEffect(() => {
    try {
      const remembered = localStorage.getItem('rememberedUsername');
      if (remembered) {
        setUsername(remembered);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setError('');
  };

  const prettyError = (raw?: string) => {
    if (!raw) return '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
    const msg = raw.toLowerCase();
    if (
      msg.includes('401') ||
      msg.includes('unauthorized') ||
      msg.includes('invalid')
    ) {
      return '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
    if (msg.includes('429') || msg.includes('too many')) {
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    }
    if (
      msg.includes('network') ||
      msg.includes('fetch') ||
      msg.includes('failed to')
    ) {
      return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
    }
    return raw;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await AuthService.loginWithCredentials(
        username,
        password
      );

      if (error || !data) {
        setError(prettyError(error));
        setLoading(false);
        return;
      }

      // remember username
      try {
        if (remember) localStorage.setItem('rememberedUsername', username);
        else localStorage.removeItem('rememberedUsername');
      } catch {
        /* ignore */
      }

      // Compute redirect target:
      // 1) honor ?next=... if present and internal
      // 2) else go to DEFAULT_AFTER_LOGIN
      const nextParam = searchParams?.get('next') || '';
      const isInternal =
        nextParam.startsWith('/') &&
        !nextParam.startsWith('//') &&
        !nextParam.startsWith('/http');

      const target = isInternal ? nextParam : DEFAULT_AFTER_LOGIN;

      router.replace(target);
    } catch (err: any) {
      setError(prettyError(err?.message));
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.loginPage}>
        {/* Logo */}
        <div className={styles.imageWrapper}>
          <Image
            src="/images/logo/loading-screen.png"
            alt="Pet Saves"
            height={94}
            width={144}
            className={styles.objectContain}
            priority
          />
        </div>

        {/* Login Form */}
        <div className={styles.loginFormContainer}>
          <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="username"
                autoComplete="username"
                className={styles.inputField}
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                required
                aria-label="아이디 (대소문자 구분 없음)"
                disabled={loading}
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
                aria-label="비밀번호"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                disabled={loading}
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
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRemember(checked);
                    try {
                      if (checked && username) {
                        localStorage.setItem('rememberedUsername', username);
                      } else if (!checked) {
                        localStorage.removeItem('rememberedUsername');
                      }
                    } catch {
                      /* ignore */
                    }
                  }}
                  disabled={loading}
                />{' '}
                아이디 저장
              </label>
            </div>

            {error && (
              <div className={styles.error} role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
