// src/components/AuthLayout/LoginForm.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import styles from './LoginForm.module.scss';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);

  const navigate = useNavigate();

  // Check for existing lockout
  useEffect(() => {
    const lockoutTime = localStorage.getItem('lockoutTime');
    const attempts = localStorage.getItem('loginAttempts');

    if (lockoutTime && attempts) {
      const lockoutTimestamp = parseInt(lockoutTime);
      const attemptCount = parseInt(attempts);

      if (Date.now() < lockoutTimestamp) {
        setIsAccountLocked(true);
        setLoginAttempts(attemptCount);
      } else {
        localStorage.removeItem('lockoutTime');
        localStorage.removeItem('loginAttempts');
      }
    } else if (attempts) {
      setLoginAttempts(parseInt(attempts));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: { email?: string; password?: string; general?: string } =
      {};

    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setErrors({});

    try {
      console.log('🔐 Attempting login with:', {
        email,
        password: '***',
        rememberMe,
      });
      console.log('🔐 Calling AuthService.login...');
      const result = await AuthService.login(email, password, rememberMe);
      console.log('🔐 Login result:', result);
      console.log('🔐 Result success:', result.success);
      console.log('🔐 Result user:', result.user);

      if (result.success && result.user) {
        console.log('✅ Login successful, navigating to dashboard');
        console.log('✅ User data:', result.user);
        console.log('✅ Token:', result.token);
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');

        // Force SecurityContext to check session again
        setTimeout(() => {
          console.log('🚀 About to navigate to /');
          navigate('/', { replace: true });
          console.log('🚀 Navigation to / called');
        }, 100);
      } else {
        console.log('❌ Login failed:', result.message);
        console.log('❌ Result object:', result);
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        if (newAttempts >= 5) {
          const lockoutTime = Date.now() + 15 * 60 * 1000;
          localStorage.setItem('lockoutTime', lockoutTime.toString());
          setIsAccountLocked(true);
          setErrors({
            general:
              'Quá nhiều lần đăng nhập thất bại. Tài khoản đã bị khóa 15 phút.',
          });
        } else {
          setErrors({
            general:
              result.message ||
              `Thông tin đăng nhập không chính xác. Còn ${5 - newAttempts} lần thử.`,
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Có lỗi xảy ra. Vui lòng thử lại sau.' });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, rememberMe, loginAttempts, navigate, validateForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setTouched({ ...touched, email: true });
    if (errors.email) {
      setErrors({ ...errors, email: undefined });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setTouched({ ...touched, password: true });
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setErrors({});
    setTouched({});
  };

  return (
    <div className={styles.loginForm}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <h1>🏢 MIA.vn</h1>
        </div>
        <h2>Chào mừng trở lại!</h2>
        <p>Đăng nhập để tiếp tục quản lý doanh nghiệp của bạn</p>

        {/* Debug Buttons - Temporary for development */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('lockoutTime');
              localStorage.removeItem('loginAttempts');
              setIsAccountLocked(false);
              setLoginAttempts(0);
              setErrors({});
              alert('Đã xóa tất cả dữ liệu lockout!');
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            🧹 Clear Lockout
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch('/api/auth/roles');
                const data = await response.json();
                console.log('Backend test result:', {
                  status: response.status,
                  data,
                });
                alert(
                  `Backend test: ${response.status === 200 ? 'OK' : 'ERROR'}\nStatus: ${response.status}\nData: ${JSON.stringify(data).substring(0, 100)}...`
                );
              } catch (error) {
                console.error('Backend test error:', error);
                alert(`Backend test ERROR: ${error.message}`);
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            🔗 Test Backend
          </button>
        </div>
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className={styles.generalError}>
          ❌<span>{errors.general}</span>
        </div>
      )}

      {/* Account Locked Warning */}
      {isAccountLocked && (
        <div className={styles.lockoutWarning}>
          ⚠️
          <span>
            Tài khoản tạm thời bị khóa vì quá nhiều lần đăng nhập thất bại
          </span>
          <button
            type="button"
            className={styles.unlockButton}
            onClick={() => {
              // Clear lockout data
              localStorage.removeItem('lockoutTime');
              localStorage.removeItem('loginAttempts');
              setIsAccountLocked(false);
              setLoginAttempts(0);
              setErrors({});
              alert('Tài khoản đã được mở khóa! Bạn có thể đăng nhập lại.');
            }}
          >
            🔓 Mở khóa tài khoản
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="email">👤 Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => setTouched({ ...touched, email: true })}
            placeholder="Nhập email của bạn"
            disabled={isLoading || isAccountLocked}
            className={errors.email && touched.email ? styles.error : ''}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && touched.email && (
            <span
              id="email-error"
              className={styles.errorMessage}
              role="alert"
              aria-live="polite"
            >
              ⚠️ {errors.email}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">🔒 Mật khẩu</label>
          <div className={styles.passwordContainer}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => setTouched({ ...touched, password: true })}
              placeholder="Nhập mật khẩu"
              disabled={isLoading || isAccountLocked}
              className={
                errors.password && touched.password ? styles.error : ''
              }
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              disabled={isLoading || isAccountLocked}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && touched.password && (
            <span
              id="password-error"
              className={styles.errorMessage}
              role="alert"
              aria-live="polite"
            >
              ⚠️ {errors.password}
            </span>
          )}
        </div>

        <div className={styles.checkbox}>
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading || isAccountLocked}
          />
          <label htmlFor="remember">Ghi nhớ đăng nhập</label>
          <a href="#" className={styles.forgotPassword}>
            Quên mật khẩu?
          </a>
        </div>

        <div className={styles.quickActions}>
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading || isAccountLocked}
            data-loading={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearForm}
            disabled={isLoading || isAccountLocked}
            title="Xóa form"
          >
            ❌ Xóa
          </button>
        </div>

        <div className={styles.footer}>
          <p>
            Chưa có tài khoản? <a href="#">Đăng ký ngay</a>
          </p>
          <p className={styles.securityNote}>
            🔒 Bảo mật với mã hóa SSL 256-bit
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
