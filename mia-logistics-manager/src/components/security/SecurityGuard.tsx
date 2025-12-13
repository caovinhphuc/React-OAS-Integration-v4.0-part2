import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurityContext } from '@/contexts/SecurityContext';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import {
  getCurrentUserPermissions,
  isUserAuthenticated,
} from '@/shared/utils/auth';

interface SecurityGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export const SecurityGuard: React.FC<SecurityGuardProps> = ({
  children,
  requireAuth = true,
  fallback,
}) => {
  // Tất cả hooks phải ở đầu component
  const { isAuthenticated, isSessionValid, checkSession, sessionInfo } =
    useSecurityContext();
  const navigate = useNavigate();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Kiểm tra session mỗi khi component mount
  useEffect(() => {
    checkSession();

    // Add delay to prevent immediate redirect
    const timeoutId = setTimeout(() => {
      if (requireAuth && !isAuthenticated) {
        console.log(
          '🚨 SecurityGuard: Redirecting to login - not authenticated'
        );
        navigate('/login', { replace: true });
        return;
      }

      if (requireAuth && !isSessionValid) {
        console.log('🚨 SecurityGuard: Redirecting to login - session invalid');
        navigate('/login', { replace: true });
        return;
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [requireAuth, isAuthenticated, isSessionValid, checkSession, navigate]);

  // Kiểm tra session mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(() => {
      checkSession();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkSession]);

  // Activity monitoring
  useEffect(() => {
    const handleUserActivity = () => {
      checkSession();
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [checkSession]);

  // Session timeout warning (5 phút trước khi hết hạn)
  useEffect(() => {
    if (
      requireAuth &&
      isAuthenticated &&
      isSessionValid &&
      sessionInfo?.lastActivity
    ) {
      const timeSinceLastActivity = Date.now() - sessionInfo.lastActivity;
      const warningThreshold = 25 * 60 * 1000; // 25 phút
      const maxExtensionTime = 20 * 60 * 1000; // 20 phút

      if (timeSinceLastActivity > warningThreshold) {
        setShowTimeoutWarning(true);
      } else if (timeSinceLastActivity > maxExtensionTime) {
        // Session quá cũ, không thể gia hạn, hiển thị warning đặc biệt
        setShowTimeoutWarning(true);
      } else {
        setShowTimeoutWarning(false);
      }
    }
  }, [requireAuth, isAuthenticated, isSessionValid, sessionInfo?.lastActivity]);

  // Debug info với permissions
  useEffect(() => {
    if (import.meta.env.DEV) {
      const permissions = getCurrentUserPermissions();
      const isAuth = isUserAuthenticated();
      console.log('SecurityGuard Debug:', {
        requireAuth,
        isAuthenticated,
        isSessionValid,
        hasLocalAuth: isAuth,
        permissions: permissions.length,
        permissionsList: permissions,
        sessionInfo: sessionInfo,
      });
    }
  }, [requireAuth, isAuthenticated, isSessionValid, sessionInfo]);

  // Loading state
  if (requireAuth && !isAuthenticated) {
    console.log('🚨 SecurityGuard: Showing loading - not authenticated', {
      requireAuth,
      isAuthenticated,
      isSessionValid,
    });
    return (
      fallback || (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
        >
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Đang kiểm tra phiên đăng nhập...
          </Typography>
        </Box>
      )
    );
  }

  // Session invalid - redirect
  if (requireAuth && !isSessionValid) {
    console.log('🚨 SecurityGuard: Session invalid - showing error', {
      requireAuth,
      isAuthenticated,
      isSessionValid,
    });
    return (
      fallback || (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
        >
          <Typography variant="h6" color="error">
            Phiên đăng nhập đã hết hạn
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng đăng nhập lại để tiếp tục
          </Typography>
        </Box>
      )
    );
  }

  // Session timeout warning UI
  if (showTimeoutWarning) {
    // Kiểm tra xem session có thể gia hạn được không
    const canExtend =
      sessionInfo?.lastActivity &&
      Date.now() - sessionInfo.lastActivity <= 20 * 60 * 1000; // 20 phút

    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            bgcolor: canExtend ? 'warning.main' : 'error.main',
            color: 'white',
            p: 3,
            borderRadius: 3,
            boxShadow: 4,
            maxWidth: 400,
            textAlign: 'center',
            animation: 'slideDown 0.3s ease-out',
            '@keyframes slideDown': {
              '0%': {
                transform: 'translateX(-50%) translateY(-100%)',
                opacity: 0,
              },
              '100%': {
                transform: 'translateX(-50%) translateY(0)',
                opacity: 1,
              },
            },
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {canExtend
              ? '⚠️ Phiên đăng nhập sắp hết hạn'
              : '🚨 Phiên đăng nhập cần đăng nhập lại'}
          </Typography>
          <Typography variant="body2" mb={3}>
            {canExtend
              ? 'Phiên đăng nhập sẽ hết hạn trong 5 phút. Vui lòng lưu công việc và chọn hành động phù hợp.'
              : 'Phiên đăng nhập quá cũ, vui lòng đăng nhập lại để đảm bảo bảo mật.'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {canExtend && (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  // Gia hạn session bằng cách reset activity
                  checkSession();
                  setShowTimeoutWarning(false);

                  // Hiển thị thông báo thành công
                  console.log('Session extended successfully');
                }}
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'success.dark' },
                }}
              >
                Gia hạn phiên
              </Button>
            )}

            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                // Lưu vị trí hiện tại
                const currentPath = window.location.pathname;
                localStorage.setItem('mia_redirect_after_login', currentPath);

                // Điều hướng đến trang đăng nhập
                window.location.href = '/login';
              }}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Đăng nhập lại
            </Button>
          </Box>
        </Box>
        {children}
      </>
    );
  }

  // Error boundary - catch any errors in children
  try {
    console.log('✅ SecurityGuard: Rendering children - all checks passed', {
      requireAuth,
      isAuthenticated,
      isSessionValid,
    });
    return <>{children}</>;
  } catch (error) {
    console.error('SecurityGuard Error:', error);
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <Typography variant="h6" color="error">
          Có lỗi xảy ra
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng thử lại hoặc liên hệ quản trị
        </Typography>
      </Box>
    );
  }
};
