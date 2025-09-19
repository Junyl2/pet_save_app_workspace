'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
/* import { FaChevronLeft } from 'react-icons/fa'; */
import styles from './LoginForm.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/userContext';
import { AuthService } from '@/app/api/services/client/auth/authService';
import { LOGIN_TYPES } from '@/app/api/types/auth/MemberSignupDto';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- helper: derive sellerId from username for demo ---
  const deriveSellerId = (u: string): number => {
    // seller / seller2 / seller-7 / seller_7 → number
    const m = u.match(/^seller(?:[-_]?(\d+))?$/i);
    if (!m) return 1; // default if pattern doesn't match
    return m[1] ? Number(m[1]) : 1;
  };

  // Handle username input changes
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setError('');
  };

  // Prefill username if previously remembered
  useEffect(() => {
    try {
      const remembered = localStorage.getItem('rememberedUsername');
      if (remembered) {
        setUsername(remembered);
        setRemember(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate input
      if (!username.trim() || !password.trim()) {
        setError('아이디와 비밀번호를 입력해주세요.');
        setLoading(false);
        return;
      }

      console.log('Attempting login with:', {
        identifier: username,
        loginType: LOGIN_TYPES.GENERAL,
      });

      // Call the real API (username will be normalized in the service)
      const response = await AuthService.loginWithCredentials(
        username.trim(),
        password,
        LOGIN_TYPES.GENERAL
      );

      // Debug: Log the response structure
      console.log('Login response in component:', response);

      if (response.error) {
        console.error('Login failed:', response.error);
        setError(response.error);
        setLoading(false);
        return;
      }

      if (response.data) {
        console.log('Login successful, response data:', response.data);

        // Handle different response structures
        let userIdentifier;
        const responseData = response.data as any; // Type assertion for flexible response handling

        if (responseData.data && responseData.data.identifier) {
          // New API structure: { data: { data: { identifier, ... } } }
          userIdentifier = responseData.data.identifier;
        } else if (responseData.user && responseData.user.identifier) {
          // Old structure: { data: { user: { identifier, ... } } }
          userIdentifier = responseData.user.identifier;
        } else if (responseData.identifier) {
          // Direct structure: { data: { identifier, ... } }
          userIdentifier = responseData.identifier;
        }

        if (userIdentifier) {
          // Update user context
          login({
            username: userIdentifier,
            role: 'client',
          });

          // Store/clear remembered username
          if (remember) {
            localStorage.setItem('rememberedUsername', username);
          } else {
            localStorage.removeItem('rememberedUsername');
          }

          // Clear any previous seller id (since this is client login)
          localStorage.removeItem('sellerId');

          // Redirect to home page
          router.push('/');
        } else {
          console.error(
            'Login response missing user identifier:',
            response.data
          );
          setError('로그인 응답에 사용자 정보가 없습니다. 다시 시도해주세요.');
          setLoading(false);
        }
      } else {
        console.error('Login response missing data:', response);
        setError('로그인 응답이 올바르지 않습니다. 다시 시도해주세요.');
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(
        err instanceof Error
          ? err.message
          : '로그인 중 알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      {/*  <div className={styles.topBar}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.backLink}
          aria-label="이전 페이지로 돌아가기"
        >
          <FaChevronLeft className={styles.arrowLeft} />
        </button>
        <span className={styles.home}>이전 페이지</span>
      </div> */}

      <div className={styles.loginPage}>
        {/* Logo - Click to go to homepage */}
        <div className={styles.imageWrapper}>
          <Image
            src="/images/logo/loading-screen.png"
            alt="Pet Saves"
            height={94}
            width={144}
            className={styles.objectContain}
            priority
            onClick={() => router.push('/')}
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
                placeholder="아이디를 입력하세요 (대소문자 구분 없음)"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                required
                aria-label="아이디 (대소문자 구분 없음)"
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
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
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
                    if (checked && username) {
                      localStorage.setItem('rememberedUsername', username);
                    }
                    if (!checked) {
                      localStorage.removeItem('rememberedUsername');
                    }
                  }}
                />{' '}
                아이디 저장
              </label>
            </div>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

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
              <Link href={PAGE_URLS.FIND_ID}>아이디 찾기</Link>
            </span>
            <div className={styles.divider}> | </div>
            <span className={styles.linkItem}>
              <Link href={PAGE_URLS.RESET_PASSWORD}>비밀번호 재설정</Link>
            </span>
            <div className={styles.divider}> | </div>
            <span className={styles.linkItem}>
              <Link href={PAGE_URLS.JOIN_MEMBERSHIP}>회원가입</Link>
            </span>
          </div>
        </div>

        {/* Social Logos (static) */}
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
    </>
  );
}
