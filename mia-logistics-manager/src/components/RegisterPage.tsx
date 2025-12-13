import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import {
  FormSkeleton,
  LoadingButton,
} from '../shared/components/LoadingStates';
import { SuccessModal, Confetti } from '../shared/components/SuccessAnimations';
// import styles from './RegisterPage.module.scss';

// CSS inline để test
const styles = {
  authLayout: 'auth-layout',
  container: 'container',
  leftSection: 'left-section',
  logo: 'logo',
  features: 'features',
  feature: 'feature',
  rightSection: 'right-section',
  formContainer: 'form-container',
  loginForm: 'login-form',
  header: 'header',
  logoIcon: 'logo-icon',
  logoText: 'logo-text',
  generalError: 'general-error',
  form: 'form',
  formGroup: 'form-group',
  labelIcon: 'label-icon',
  error: 'error',
  errorMessage: 'error-message',
  passwordContainer: 'password-container',
  passwordToggle: 'password-toggle',
  formOptions: 'form-options',
  checkbox: 'checkbox',
  forgotPassword: 'forgot-password',
  loginButton: 'login-button',
  quickActions: 'quick-actions',
  clearButton: 'clear-button',
  footer: 'footer',
  signupLink: 'signup-link',
  securityNote: 'security-note',
  serverStatus: 'server-status',
  lockoutWarning: 'lockout-warning',
};

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  agreeToTerms?: string;
  general?: string;
}

interface ServerStatus {
  status: 'checking' | 'online' | 'offline';
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Form validation setup
  const {
    values: formData,
    errors,
    touched,
    isValidating,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
  } = useFormValidation<RegisterFormData>(
    {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      agreeToTerms: false,
    },
    {
      rules: {
        fullName: validationRules.fullName,
        email: validationRules.email,
        password: validationRules.password,
        confirmPassword: {
          ...validationRules.confirmPassword,
          custom: (value) => {
            if (value !== formData.password) {
              return 'Mật khẩu xác nhận không khớp';
            }
            return null;
          },
        },
        phone: validationRules.phone,
        agreeToTerms: {
          required: true,
          message: 'Bạn phải đồng ý với điều khoản sử dụng',
        },
      },
      validateOnChange: true,
      validateOnBlur: true,
      debounceMs: 300,
    }
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] =
    useState<ServerStatus['status']>('checking');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Check server status on mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        setServerStatus('checking');
        const response = await fetch('/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.log('Server check failed:', error);
        setServerStatus('offline');
      }
    };

    checkServerStatus();
  }, []);

  // Removed old validation functions - now using useFormValidation hook

  const handleFormSubmit = handleSubmit(async (values) => {
    setLoading(true);

    try {
      // Gọi API đăng ký
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phone: values.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Đăng ký thất bại');
      }

      console.log('Đăng ký thành công', data);

      // Show success animations
      setShowConfetti(true);
      setShowSuccessModal(true);

      // Navigate to login after delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // Handle error - could be improved with better error handling
      console.error('Registration error:', err);
      alert(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
      );
    } finally {
      setLoading(false);
    }
  });

  const clearForm = () => {
    reset();
  };

  return (
    <>
      <style>{`
        /* Auth Layout - 2 Column Design */
        .auth-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #ff7800 0%, #ff9500 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @media (max-width: 768px) {
          .auth-layout {
            padding: 1rem;
          }
        }

        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-width: 1200px;
          width: 100%;
          min-height: 600px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
        }

        @media (max-width: 1024px) {
          .container {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
        }

        /* Left Section - Branding */
        .left-section {
          background: linear-gradient(135deg, #ff7800 0%, #cc6000 100%);
          color: white;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        @media (max-width: 1024px) {
          .left-section {
            display: none;
          }
        }

        .logo {
          margin-bottom: 3rem;
          animation: slideInFromLeft 0.8s ease-out 0.2s both;
        }

        .logo h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, white, rgba(255, 255, 255, 0.9));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          letter-spacing: -0.02em;
          transition: transform 0.3s ease;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .logo h1:hover {
          transform: scale(1.05);
        }

        .logo p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin: 0;
          font-weight: 400;
          line-height: 1.5;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .feature h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          line-height: 1.3;
          opacity: 0.95;
        }

        .feature p {
          opacity: 0.9;
          line-height: 1.5;
          margin: 0;
          font-size: 1rem;
          font-weight: 400;
        }

        /* Right Section - Login Form */
        .right-section {
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ffffff 0%, #fff7f0 100%);
        }

        @media (max-width: 768px) {
          .right-section {
            padding: 2rem;
          }
        }

        .form-container {
          width: 100%;
          max-width: 400px;
          animation: fadeInUp 0.6s ease-out;
        }

        .login-form {
          width: 100%;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .header .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 1rem;
        }

        .header .logo-icon {
          width: 32px;
          height: 32px;
          background: #ff7800;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        .header .logo-text {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }

        .header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #333;
          line-height: 1.2;
          letter-spacing: -0.01em;
          animation: slideInFromLeft 0.8s ease-out 0.4s both;
        }

        .header p {
          color: #666;
          margin-bottom: 0;
          font-size: 1.1rem;
          line-height: 1.4;
          font-weight: 400;
          animation: slideInFromLeft 0.8s ease-out 0.6s both;
        }

        /* Form */
        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          animation: slideInFromLeft 0.8s ease-out both;
        }

        .form-group:nth-child(1) {
          animation-delay: 0.8s;
        }
        .form-group:nth-child(2) {
          animation-delay: 1s;
        }
        .form-group:nth-child(3) {
          animation-delay: 1.2s;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s ease;
        }

        .form-group .label-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #666;
        }

        .form-group input {
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.5;
          color: #333;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          position: relative;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          min-height: 52px;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff7800;
          box-shadow: 0 0 0 3px rgba(255, 120, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .form-group input::placeholder {
          color: #9ca3af;
          font-weight: 400;
          transition: opacity 0.2s ease;
        }

        .form-group input:focus::placeholder {
          opacity: 0.7;
        }

        .form-group input.error {
          border-color: #f44336;
          box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
          animation: shake 0.3s ease-in-out;
        }

        .form-group input:hover:not(:focus):not(.error) {
          border-color: #ff7800;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }

        /* Password Container */
        .password-container {
          position: relative;
        }

        .password-container input {
          padding-right: 3rem;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          font-size: 20px;
        }

        .password-toggle:hover:not(:disabled) {
          background: #f5f5f5;
          color: #ff7800;
          transform: translateY(-50%) scale(1.1);
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Error Messages */
        .error-message {
          color: #f44336;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          margin-top: -0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          animation: fadeInUp 0.3s ease;
        }

        .error-message::before {
          content: '⚠️';
          font-size: 0.7rem;
        }

        .general-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px 16px;
          margin-bottom: 1rem;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          animation: shake 0.5s ease-in-out;
          background: linear-gradient(135deg, #fee 0%, #fdd 100%) !important;
          border: 1px solid #f44336 !important;
          color: #f44336 !important;
          text-shadow: 0 0 1px rgba(0,0,0,0.1);
        }

        .general-error * {
          color: #f44336 !important;
        }


        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .form-options {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .checkbox input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #ff7800;
        }

        .checkbox label {
          font-size: 14px;
          color: #666;
          cursor: pointer;
          font-weight: 400;
          transition: color 0.2s ease;
        }

        .checkbox:hover label {
          color: #333;
        }

        .forgot-password {
          background: none;
          border: none;
          color: #ff7800;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          text-decoration: underline;
        }

        .forgot-password:hover:not(:disabled) {
          background: rgba(255, 120, 0, 0.1);
          transform: translateY(-1px);
        }

        .forgot-password:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Action Buttons */
        .login-button {
          width: 100%;
          height: 52px;
          font-weight: 600;
          font-size: 16px;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          background: #ff7800;
          color: white;
          border: none;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(255, 120, 0, 0.3), 0 4px 6px -2px rgba(255, 120, 0, 0.2);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 4px -1px rgba(255, 120, 0, 0.2), 0 1px 2px -1px rgba(255, 120, 0, 0.1);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: flex-start;
        }

        .clear-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border: 2px solid #f44336;
          border-radius: 8px;
          background: white;
          color: #f44336;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          min-height: 44px;
        }

        .clear-button:hover:not(:disabled) {
          background: #f44336;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .clear-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: 2rem;
        }

        .footer p {
          color: #666;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .signup-link {
          background: none;
          border: none;
          color: #ff7800;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          text-decoration: underline;
        }

        .signup-link:hover:not(:disabled) {
          background: rgba(255, 120, 0, 0.1);
          transform: translateY(-1px);
        }

        .signup-link:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .security-note {
          color: #4caf50;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          margin-top: 1rem;
        }

        /* Server Status Indicator */
        .server-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          margin-top: 12px;
          border: 1px solid;
          transition: all 0.3s ease;
          text-align: center;
          justify-content: center;
        }

        .server-status-checking {
          background-color: rgba(255, 193, 7, 0.2) !important;
          border-color: #ffc107 !important;
          color: #856404 !important;
          box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
        }

        .server-status-online {
          background-color: rgba(40, 167, 69, 0.2) !important;
          border-color: #28a745 !important;
          color: #155724 !important;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
        }

        .server-status-offline {
          background-color: rgba(220, 53, 69, 0.2) !important;
          border-color: #dc3545 !important;
          color: #721c24 !important;
          box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
        }

        /* Account Lockout Warning */
        .lockout-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px 16px;
          margin-bottom: 1rem;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          animation: shake 0.5s ease-in-out;
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border: 1px solid #f0ad4e;
          color: #856404;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .auth-layout {
            padding: 1rem;
          }

          .container {
            grid-template-columns: 1fr;
            max-width: 520px;
            min-height: auto;
          }

          .left-section {
            display: none;
          }

          .right-section {
            padding: 2rem 1.5rem;
          }

          .form-container {
            max-width: 100%;
          }

          .header h2 {
            font-size: 1.8rem;
          }

          .header p {
            font-size: 1rem;
          }

          .form {
            gap: 1.25rem;
          }

          .form-group input {
            padding: 14px 16px;
            font-size: 16px;
            min-height: 52px;
          }

          .login-button {
            height: 52px;
            font-size: 16px;
          }

          .form-options {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .quick-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .clear-button {
            height: 44px;
            padding: 12px 16px;
          }
        }

        /* Tablet */
        @media (min-width: 769px) and (max-width: 1024px) {
          .container {
            max-width: 800px;
          }

          .left-section {
            padding: 2.5rem;
          }

          .right-section {
            padding: 2.5rem;
          }
        }

        /* Desktop */
        @media (min-width: 1025px) {
          .container {
            max-width: 1200px;
          }

          .form-group input:hover:not(:focus):not(.error) {
            transform: translateY(-1px);
          }

          .login-button:hover {
            transform: translateY(-3px);
          }
        }
      `}</style>
      <div className={styles.authLayout}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <div className={styles.logo}>
              <h1>MIA.vn</h1>
              <p>Quản lý kinh doanh thông minh</p>
            </div>
            <div className={styles.features}>
              <div className={styles.feature}>
                <h3>📊 Dashboard Thông Minh</h3>
                <p>Theo dõi hiệu suất kinh doanh real-time</p>
              </div>
              <div className={styles.feature}>
                <h3>🚀 Tự Động Hóa</h3>
                <p>Giảm thiểu công việc thủ công</p>
              </div>
              <div className={styles.feature}>
                <h3>📈 Báo Cáo Chi Tiết</h3>
                <p>Phân tích sâu dữ liệu kinh doanh</p>
              </div>
            </div>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.formContainer}>
              <div className={styles.loginForm}>
                {/* Header */}
                <div className={styles.header}>
                  <div className={styles.logo}>
                    <div className={styles.logoIcon}>M</div>
                    <div className={styles.logoText}>MIA.vn</div>
                  </div>
                  <h2>Đăng ký tài khoản mới!</h2>
                  <p>Tạo tài khoản để bắt đầu quản lý doanh nghiệp của bạn</p>

                  {/* Server Status Indicator */}
                  <div
                    className={`${styles.serverStatus} server-status-${serverStatus}`}
                  >
                    {serverStatus === 'checking' && (
                      <>
                        <span>⚙️</span>
                        <span>Đang kiểm tra kết nối...</span>
                      </>
                    )}
                    {serverStatus === 'online' && (
                      <>
                        <span>✅</span>
                        <span>Kết nối server thành công</span>
                      </>
                    )}
                    {serverStatus === 'offline' && (
                      <>
                        <span>❌</span>
                        <span>Không thể kết nối server</span>
                      </>
                    )}
                  </div>
                </div>

                {/* General Error Message */}
                {errors.general && (
                  <div className={styles.generalError}>❌ {errors.general}</div>
                )}

                {/* Account Locked Warning - Not needed for register */}

                {/* Form */}
                {loading && isValidating ? (
                  <FormSkeleton fields={6} showButton={true} />
                ) : (
                  <form
                    onSubmit={handleFormSubmit}
                    className={styles.form}
                    noValidate
                  >
                    {/* Full Name Field */}
                    <div className={styles.formGroup}>
                      <label htmlFor="fullName">
                        <span className={styles.labelIcon}>👤</span>
                        HỌ TÊN
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        {...getFieldProps('fullName')}
                        placeholder="Nhập họ tên đầy đủ"
                        required
                        autoComplete="name"
                        className={
                          getFieldProps('fullName').hasError ? styles.error : ''
                        }
                        disabled={loading}
                      />
                      {getFieldProps('fullName').error && (
                        <span className={styles.errorMessage}>
                          {getFieldProps('fullName').error}
                        </span>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className={styles.formGroup}>
                      <label htmlFor="email">
                        <span className={styles.labelIcon}>📧</span>
                        EMAIL
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        placeholder="Nhập email của bạn"
                        required
                        autoComplete="email"
                        className={errors.email ? styles.error : ''}
                        disabled={loading}
                      />
                      {errors.email && (
                        <span className={styles.errorMessage}>
                          {errors.email}
                        </span>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className={styles.formGroup}>
                      <label htmlFor="phone">
                        <span className={styles.labelIcon}>📱</span>
                        SỐ ĐIỆN THOẠI
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        placeholder="Nhập số điện thoại"
                        required
                        autoComplete="tel"
                        className={errors.phone ? styles.error : ''}
                        disabled={loading}
                      />
                      {errors.phone && (
                        <span className={styles.errorMessage}>
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className={styles.formGroup}>
                      <label htmlFor="password">
                        <span className={styles.labelIcon}>🔒</span>
                        MẬT KHẨU
                      </label>
                      <div className={styles.passwordContainer}>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange('password', e.target.value)
                          }
                          placeholder="Nhập mật khẩu"
                          required
                          autoComplete="new-password"
                          className={errors.password ? styles.error : ''}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          disabled={loading}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {errors.password && (
                        <span className={styles.errorMessage}>
                          {errors.password}
                        </span>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className={styles.formGroup}>
                      <label htmlFor="confirmPassword">
                        <span className={styles.labelIcon}>🔒</span>
                        XÁC NHẬN MẬT KHẨU
                      </label>
                      <div className={styles.passwordContainer}>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange('confirmPassword', e.target.value)
                          }
                          placeholder="Nhập lại mật khẩu"
                          required
                          autoComplete="new-password"
                          className={errors.confirmPassword ? styles.error : ''}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          title={
                            showConfirmPassword
                              ? 'Ẩn mật khẩu'
                              : 'Hiện mật khẩu'
                          }
                          disabled={loading}
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <span className={styles.errorMessage}>
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>

                    {/* Terms Agreement */}
                    <div className={styles.formGroup}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={(e) =>
                            handleInputChange('agreeToTerms', e.target.checked)
                          }
                          disabled={loading}
                        />
                        <label htmlFor="agreeToTerms">
                          Tôi đồng ý với{' '}
                          <button
                            type="button"
                            className={styles.forgotPassword}
                            onClick={() =>
                              alert('Điều khoản sử dụng sẽ được hiển thị')
                            }
                          >
                            Điều khoản sử dụng
                          </button>
                        </label>
                      </div>
                      {errors.agreeToTerms && (
                        <span className={styles.errorMessage}>
                          {errors.agreeToTerms}
                        </span>
                      )}
                    </div>

                    {/* Register Button */}
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      className={styles.loginButton}
                      disabled={!isValid || loading}
                    >
                      {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                    </LoadingButton>

                    {/* Quick Actions */}
                    <div className={styles.quickActions}>
                      <button
                        type="button"
                        className={styles.clearButton}
                        onClick={clearForm}
                        disabled={loading}
                        title="Xóa form"
                      >
                        ❌ Xóa
                      </button>
                    </div>
                  </form>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                  <p>
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      className={styles.signupLink}
                      disabled={loading}
                      onClick={() => navigate('/login')}
                    >
                      Đăng nhập ngay
                    </button>
                  </p>
                  <p className={styles.securityNote}>
                    🔒 Bảo mật với mã hóa SSL
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        title="Đăng ký thành công!"
        message="Tài khoản của bạn đã được tạo thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập."
        onClose={() => setShowSuccessModal(false)}
        type="success"
        showCheckmark={true}
      />

      {/* Confetti Animation */}
      <Confetti show={showConfetti} duration={3000} />
    </>
  );
};

export default RegisterPage;
