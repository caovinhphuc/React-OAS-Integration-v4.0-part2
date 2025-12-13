// src/pages/LoginPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
// import { Icon } from '../components/atoms/Icon'; // Using emojis instead
import AuthService from '../services/authService';
import styles from './LoginPage.module.scss';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
  const [serverStatus, setServerStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if user is already authenticated
        if (AuthService.isAuthenticated() && !AuthService.isSessionExpired()) {
          const user = AuthService.getCurrentUser();
          if (user) {
            navigate('/dashboard');
            return;
          }
        }

        // Check server status
        const healthCheck = await AuthService.healthCheck();
        setServerStatus(
          healthCheck.status === 'healthy' ? 'online' : 'offline'
        );
      } catch {
        setServerStatus('offline');
      }
    };

    // Check local lockout status
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    const lockoutTime = localStorage.getItem('lockoutTime');

    if (lockoutTime && Date.now() < parseInt(lockoutTime)) {
      setIsAccountLocked(true);
      setLoginAttempts(attempts);
    } else {
      // Clear lockout if time has passed
      localStorage.removeItem('lockoutTime');
      localStorage.removeItem('loginAttempts');
    }

    checkAuthStatus();
  }, [navigate]);

  // Real-time validation
  const validateField = useCallback(
    (field: 'email' | 'password', value: string) => {
      const newErrors = { ...errors };

      if (field === 'email') {
        if (!value) {
          newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Email không hợp lệ';
        } else {
          delete newErrors.email;
        }
      }

      if (field === 'password') {
        if (!value) {
          newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (value.length < 6) {
          newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else {
          delete newErrors.password;
        }
      }

      setErrors(newErrors);
    },
    [errors]
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; general?: string } =
      {};

    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);

      if (touched.email) {
        validateField('email', value);
      }
    },
    [touched.email, validateField]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPassword(value);

      if (touched.password) {
        validateField('password', value);
      }
    },
    [touched.password, validateField]
  );

  const handleFieldBlur = useCallback(
    (field: 'email' | 'password') => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (field === 'email') {
        validateField('email', email);
      } else {
        validateField('password', password);
      }
    },
    [email, password, validateField]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAccountLocked) {
      setErrors({
        general: 'Tài khoản đã bị khóa tạm thời. Vui lòng thử lại sau 15 phút.',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Call authentication service
      const result = await AuthService.login(email, password, rememberMe);

      if (result.success && result.user) {
        // Successful login
        // Clear login attempts
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');

        // Navigate to dashboard
        navigate('/');
      } else {
        // Failed login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        if (newAttempts >= 5) {
          // Lock account for 15 minutes
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
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setErrors({});
    setTouched({});
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Panel - Orange with Branding & Features */}
      <div className={styles.leftPanel}>
        <div className={styles.leftHeader}>
          <h1>MIA.vn</h1>
          <p>Quản lý kinh doanh thông minh</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📊</div>
            <div className={styles.featureText}>
              <h3>Dashboard Thông Minh</h3>
              <p>Theo dõi hiệu suất kinh doanh real-time</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>🚀</div>
            <div className={styles.featureText}>
              <h3>Tự Động Hóa</h3>
              <p>Giảm thiểu công việc thủ công</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>📋</div>
            <div className={styles.featureText}>
              <h3>Báo Cáo Chi Tiết</h3>
              <p>Phân tích dữ liệu chuyên sâu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - White with Login Form */}
      <div className={styles.rightPanel}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <h1>🏢 MIA.vn</h1>
          </div>
          <h2>Chào mừng trở lại!</h2>
          <p>Đăng nhập để tiếp tục quản lý doanh nghiệp của bạn</p>
        </div>

        {/* Server Status Indicator */}
        <div className={`${styles.serverStatus} ${styles[serverStatus]}`}>
          {serverStatus === 'checking' && (
            <>
              ⚙️
              <span>Đang kiểm tra kết nối...</span>
            </>
          )}
          {serverStatus === 'online' && (
            <>
              ✅<span>Kết nối server thành công</span>
            </>
          )}
          {serverStatus === 'offline' && (
            <>
              ❌<span>Không thể kết nối server</span>
            </>
          )}
        </div>

        {/* Debug Test Button - Temporary */}
        <button
          type="button"
          onClick={async () => {
            console.log('🧪 Testing API from UI...');
            try {
              const healthCheck = await AuthService.healthCheck();
              console.log('Health check result:', healthCheck);
              alert(`Health Check: ${JSON.stringify(healthCheck)}`);
            } catch (error: unknown) {
              console.error('Test error:', error);
              alert(
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          }}
          className={styles.debugButton}
        >
          🧪 Test API Connection
        </button>

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
              onBlur={() => handleFieldBlur('email')}
              placeholder="Nhập email của bạn"
              required
              autoComplete="email"
              className={errors.email ? styles.error : ''}
              disabled={isLoading || isAccountLocked}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className={styles.errorText} role="alert">
                {errors.email}
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
                onBlur={() => handleFieldBlur('password')}
                placeholder="Nhập mật khẩu"
                required
                autoComplete="current-password"
                className={errors.password ? styles.error : ''}
                disabled={isLoading || isAccountLocked}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
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
            {errors.password && (
              <span
                id="password-error"
                className={styles.errorText}
                role="alert"
              >
                {errors.password}
              </span>
            )}
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || isAccountLocked}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <button
              type="button"
              className={styles.forgotPassword}
              disabled={isLoading || isAccountLocked}
              onClick={() => navigate('/auth/forgot-password')}
            >
              Quên mật khẩu?
            </button>
          </div>

          <div className={styles.actionButtons}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className={styles.submitButton}
              disabled={isLoading || isAccountLocked}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </Button>

            <div className={styles.quickActions}>
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
          </div>

          <div className={styles.footer}>
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                className={styles.signupLink}
                disabled={isLoading}
                onClick={() => navigate('/auth/register')}
              >
                Đăng ký ngay
              </button>
            </p>
            <p className={styles.securityNote}>
              🔒 Bảo mật với mã hóa SSL 256-bit
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
