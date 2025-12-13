import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  CssBaseline,
  FormControlLabel,
  Checkbox,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/config/theme';
import { logService } from '@/services/logService';
import { ERROR_MESSAGES } from '@/shared/constants';
import {
  saveRememberMe,
  loadRememberMe,
  clearRememberMe,
} from '@/utils/rememberMe';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedData = loadRememberMe();

    if (rememberedData) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedData.email,
        password: rememberedData.password || '',
        rememberMe: true,
      }));

      console.log('Remembered credentials loaded successfully');
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Handle remember me checkbox change
    if (field === 'rememberMe' && !value) {
      // User unchecked remember me, clear stored credentials
      clearRememberMe();
      console.log('Remembered credentials cleared by user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await logService.init();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || ERROR_MESSAGES.LOGIN_FAILED);
      }

      // Handle remember me functionality
      if (formData.rememberMe) {
        const success = saveRememberMe(formData.email, formData.password);
        if (success) {
          console.log('Credentials remembered successfully');
        }
      } else {
        clearRememberMe();
        console.log('Remembered credentials cleared');
      }

      // Fetch user permissions from backend
      let userPermissions = [];
      try {
        const permissionsResponse = await fetch(
          `/api/auth/role-permissions?roleId=${data.roleId}`
        );
        if (permissionsResponse.ok) {
          const rolePermissions = await permissionsResponse.json();
          userPermissions = rolePermissions.map((rp: any) => ({
            resource: rp.resource,
            action: rp.action,
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch permissions:', error);
      }

      // Store session data with permissions
      const sessionData = {
        user: {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          roleId: data.roleId,
        },
        permissions: userPermissions,
        ts: Date.now(),
        token: data.token, // Add JWT token if available
        refreshToken: data.refreshToken, // Add refresh token if available
      };

      // Store session in localStorage
      localStorage.setItem('mia_session', JSON.stringify(sessionData));
      console.log('Session data stored successfully');

      // Note: Logging is now handled by SessionManager
      // This prevents duplicate logging to Google Sheets
      console.log('Login successful, SessionManager will handle logging');

      // Test session storage
      console.log('=== Login Success Debug ===');
      console.log('Session data stored:', sessionData);
      console.log('LocalStorage session:', localStorage.getItem('mia_session'));

      // Kiểm tra xem có cần redirect về vị trí cũ không
      const redirectPath = localStorage.getItem('mia_redirect_after_login');

      if (redirectPath && redirectPath !== '/login') {
        // Xóa redirect path và chuyển về vị trí cũ
        localStorage.removeItem('mia_redirect_after_login');
        console.log('Redirecting to previous location:', redirectPath);
        navigate(redirectPath);
      } else {
        // Redirect to dashboard
        navigate('/');
      }
    } catch (err) {
      setErrors({
        general:
          err instanceof Error ? err.message : ERROR_MESSAGES.LOGIN_FAILED,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    alert(
      'Tính năng quên mật khẩu sẽ được phát triển trong phiên bản tiếp theo'
    );
  };

  const handleRegister = () => {
    // TODO: Implement registration functionality
    alert('Tính năng đăng ký sẽ được phát triển trong phiên bản tiếp theo');
  };

  // Debug function đã bị xóa để giảm noise trong console

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3 },
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Fade in timeout={800}>
          <Paper
            sx={{
              width: '100%',
              maxWidth: 450,
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              zIndex: 1,
            }}
            elevation={12}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <BusinessIcon
                  sx={{ fontSize: 40, color: 'primary.main', mr: 1 }}
                />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: 'primary.main' }}
                >
                  MIA Logistics
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}
              >
                Đăng nhập hệ thống
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Vui lòng nhập thông tin đăng nhập của bạn
              </Typography>
            </Box>

            {/* Form */}
            <Stack component="form" spacing={3} onSubmit={handleSubmit}>
              {errors.general && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.general}
                </Alert>
              )}

              {/* Email Field */}
              <TextField
                label="Email"
                type="email"
                size="medium"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                size="medium"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              {/* Remember Me & Forgot Password */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        handleInputChange('rememberMe', e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Ghi nhớ đăng nhập"
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleForgotPassword}
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' },
                      fontSize: '0.875rem',
                    }}
                  >
                    Quên mật khẩu?
                  </Link>
                  {/* Debug button đã bị xóa để giảm noise trong console */}
                </Stack>
              </Box>

              {/* Login Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ArrowForwardIcon />
                  )
                }
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  },
                  '&:disabled': {
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    opacity: 0.7,
                  },
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', px: 2 }}
                >
                  hoặc
                </Typography>
              </Divider>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Chưa có tài khoản?
                </Typography>
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleRegister}
                  sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Đăng ký ngay
                </Link>
              </Box>
            </Stack>
          </Paper>
        </Fade>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
