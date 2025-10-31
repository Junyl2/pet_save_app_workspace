'use client';

import { useEffect, useState, FormEvent } from 'react';
import Image from 'next/image';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthService } from '@/app/api/services/client/auth/authService';
import styles from './page.module.css';

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
      const remembered = localStorage.getItem('adminRememberedUsername');
      if (remembered) {
        setUsername(remembered);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ✅ Always keep the remembered username synced
  useEffect(() => {
    if (remember && username.trim()) {
      localStorage.setItem('adminRememberedUsername', username.trim());
    } else if (!remember) {
      localStorage.removeItem('adminRememberedUsername');
    }
  }, [remember, username]);

  const prettyError = (raw?: string): string => {
    if (!raw) return '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
    const msg = raw.toLowerCase();
    if (
      msg.includes('401') ||
      msg.includes('unauthorized') ||
      msg.includes('invalid')
    )
      return '아이디 또는 비밀번호가 올바르지 않습니다.';
    if (msg.includes('429') || msg.includes('too many'))
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    if (
      msg.includes('network') ||
      msg.includes('fetch') ||
      msg.includes('failed to')
    )
      return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
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

      const permissions = Array.isArray(data.data?.permissions)
        ? (data.data.permissions as string[])
        : [];

      if (!permissions.includes('ADMIN')) {
        toast.error('관리자 권한이 없습니다.');
        setLoading(false);
        return;
      }

      localStorage.setItem(
        'adminAuthToken',
        localStorage.getItem('authToken') ?? ''
      );
      localStorage.setItem(
        'adminRefreshToken',
        localStorage.getItem('refreshToken') ?? ''
      );
      localStorage.setItem(
        'adminUserInfo',
        localStorage.getItem('userInfo') ?? ''
      );

      const nextParam = searchParams?.get('next') || '';
      const isInternal =
        nextParam.startsWith('/') &&
        !nextParam.startsWith('//') &&
        !nextParam.startsWith('/http');

      const target = isInternal ? nextParam : DEFAULT_AFTER_LOGIN;
      toast.success('관리자 로그인 성공');
      router.replace(target);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(prettyError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.loginPage}>
        <div className={styles.imageWrapper}>
          <Image
            src="/images/logo/loading-screen.png"
            alt="Pet Save"
            height={94}
            width={144}
            className={styles.objectContain}
            priority
          />
        </div>

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
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                className={styles.inputField}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              아이디 저장
            </label>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
