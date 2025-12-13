import { useEffect, useCallback, useState } from 'react';
import SessionManager from '@/services/auth/sessionManager';

interface SecurityState {
  isAuthenticated: boolean;
  sessionInfo: {
    userId: string | null;
    email: string | null;
    lastActivity: number | null;
    deviceId: string | null;
  } | null;
  isSessionValid: boolean;
}

export const useSecurity = () => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    isAuthenticated: false,
    sessionInfo: null,
    isSessionValid: false,
  });

  const sessionManager = SessionManager.getInstance();

  // Debug state changes
  useEffect(() => {
    console.log('🔍 useSecurity state changed:', securityState);
  }, [securityState]);

  // Initialize state on mount
  useEffect(() => {
    const isValid = sessionManager.isSessionValid();
    const sessionInfo = sessionManager.getSessionInfo();
    const initialState = {
      isAuthenticated: isValid && !!sessionInfo?.userId,
      sessionInfo: sessionInfo
        ? {
            userId: sessionInfo.userId || null,
            email: sessionInfo.email || null,
            lastActivity: sessionInfo.lastActivity || null,
            deviceId: sessionInfo.deviceId || null,
          }
        : null,
      isSessionValid: isValid,
    };
    console.log('🔍 useSecurity initializing state:', initialState);
    setSecurityState(initialState);
  }, []);

  // Kiểm tra session validity
  const checkSession = useCallback(() => {
    const isValid = sessionManager.isSessionValid();
    const sessionInfo = sessionManager.getSessionInfo();

    console.log('🔍 useSecurity.checkSession:', {
      isValid,
      sessionInfo,
      hasUserId: !!sessionInfo?.userId,
      willBeAuthenticated: isValid && !!sessionInfo?.userId,
    });

    setSecurityState({
      isAuthenticated: isValid && !!sessionInfo?.userId,
      sessionInfo: sessionInfo
        ? {
            userId: sessionInfo.userId || null,
            email: sessionInfo.email || null,
            lastActivity: sessionInfo.lastActivity || null,
            deviceId: sessionInfo.deviceId || null,
          }
        : null,
      isSessionValid: isValid,
    });

    return isValid;
  }, [sessionManager]);

  // Khởi tạo session
  const initializeSession = useCallback(
    async (token: string, refreshToken: string) => {
      const success = await sessionManager.initializeSession(
        token,
        refreshToken
      );
      if (success) {
        checkSession();
      }
      return success;
    },
    [sessionManager, checkSession]
  );

  // Refresh session
  const refreshSession = useCallback(async () => {
    const success = await sessionManager.refreshSession();
    if (success) {
      checkSession();
    }
    return success;
  }, [sessionManager, checkSession]);

  // Logout
  const logout = useCallback(
    (reason?: string) => {
      sessionManager.logout(reason);
      setSecurityState({
        isAuthenticated: false,
        sessionInfo: null,
        isSessionValid: false,
      });
    },
    [sessionManager]
  );

  // Force check session khi component mount
  useEffect(() => {
    checkSession();

    // Kiểm tra session mỗi 30 giây
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [checkSession]);

  // Auto logout khi session invalid
  useEffect(() => {
    if (!securityState.isSessionValid && securityState.isAuthenticated) {
      logout('Session validation failed');
    }
  }, [securityState.isSessionValid, securityState.isAuthenticated, logout]);

  return {
    ...securityState,
    initializeSession,
    refreshSession,
    logout,
    checkSession,
  };
};
