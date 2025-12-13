import { jwtDecode } from 'jwt-decode';

interface SessionData {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: number;
  deviceId: string;
}

interface JWTPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
  deviceId: string;
  ipAddress: string;
}

class SessionManager {
  private static instance: SessionManager;
  private sessionData: SessionData | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private sessionTimeout: number = 30 * 60 * 1000; // 30 phút
  private checkInterval: number = 60 * 1000; // Kiểm tra mỗi phút
  private isLoggingOut: boolean = false; // Prevent duplicate logout

  private constructor() {
    this.initializeActivityMonitoring();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Khởi tạo session
  public async initializeSession(
    token: string,
    refreshToken: string
  ): Promise<boolean> {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now();

      // Kiểm tra token expiration
      if (decoded.exp * 1000 < currentTime) {
        this.logout('Token expired');
        return false;
      }

      // Lấy thông tin thiết bị và IP
      const deviceInfo = await this.getDeviceInfo();
      const ipAddress = await this.getCurrentIP();

      this.sessionData = {
        token,
        refreshToken,
        userId: decoded.sub,
        email: decoded.email,
        ipAddress,
        userAgent: navigator.userAgent,
        lastActivity: currentTime,
        deviceId: deviceInfo.deviceId,
      };

      // Kiểm tra IP validation
      if (decoded.ipAddress !== ipAddress) {
        this.logout('IP address changed');
        return false;
      }

      // Kiểm tra device validation
      if (decoded.deviceId !== deviceInfo.deviceId) {
        this.logout('Device changed');
        return false;
      }

      this.startActivityTimer();
      this.isLoggingOut = false; // Reset logout flag
      this.logActivity('SESSION_STARTED', {
        loginMethod: 'UI_FRONTEND',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Session initialization failed:', error);
      this.logout('Session initialization failed');
      return false;
    }
  }

  // Kiểm tra session validity
  public isSessionValid(): boolean {
    // First check if we have session data
    if (!this.sessionData) {
      // Fallback: check AuthService session
      try {
        const authToken =
          localStorage.getItem('authToken') ||
          sessionStorage.getItem('authToken');
        const userData =
          localStorage.getItem('userData') ||
          sessionStorage.getItem('userData');

        if (authToken && userData) {
          console.log('✅ Found AuthService session, considering valid');
          return true;
        }
      } catch (error) {
        console.warn('Failed to parse AuthService session:', error);
      }

      // Fallback: check localStorage session
      try {
        const storedSession = localStorage.getItem('mia_session');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          const currentTime = Date.now();
          const sessionAge = currentTime - session.ts;

          // Check if session is not too old (24 hours)
          if (sessionAge < 24 * 60 * 60 * 1000) {
            return true;
          } else {
            // Session too old, clear it
            localStorage.removeItem('mia_session');
            return false;
          }
        }
      } catch (error) {
        console.warn('Failed to parse stored session:', error);
        localStorage.removeItem('mia_session');
      }
      return false;
    }

    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - this.sessionData.lastActivity;

    // Kiểm tra session timeout
    if (timeSinceLastActivity > this.sessionTimeout) {
      this.logout('Session timeout');
      return false;
    }

    // Kiểm tra token expiration (only if we have a token)
    if (this.sessionData.token) {
      try {
        const decoded = jwtDecode<JWTPayload>(this.sessionData.token);
        if (decoded.exp * 1000 < currentTime) {
          this.logout('Token expired');
          return false;
        }
      } catch {
        this.logout('Invalid token');
        return false;
      }
    }

    return true;
  }

  // Cập nhật activity
  public updateActivity(): void {
    if (this.sessionData) {
      this.sessionData.lastActivity = Date.now();
      this.resetActivityTimer();
    }
  }

  // Refresh token
  public async refreshSession(): Promise<boolean> {
    if (!this.sessionData?.refreshToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.sessionData.refreshToken,
        }),
      });

      if (response.ok) {
        const { token, refreshToken } = await response.json();
        return await this.initializeSession(token, refreshToken);
      } else {
        this.logout('Refresh token failed');
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout('Token refresh failed');
      return false;
    }
  }

  // Logout
  public logout(reason: string = 'User logout'): void {
    // Prevent duplicate logout logging
    if (this.isLoggingOut || !this.sessionData) {
      return;
    }

    // Set logout flag to prevent duplicate calls
    this.isLoggingOut = true;

    // Enhanced logout logging
    this.logActivity('SESSION_ENDED', {
      reason,
      logoutMethod: 'SYSTEM_AUTO',
      sessionDuration: Date.now() - this.sessionData.lastActivity,
      timestamp: new Date().toISOString(),
    });

    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }

    // Clear session data
    this.sessionData = null;

    // Redirect to login
    window.location.href = '/login';
  }

  // Lấy thông tin thiết bị
  private async getDeviceInfo(): Promise<{ deviceId: string }> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const deviceId = btoa(canvas.toDataURL()).slice(0, 32);
    return { deviceId };
  }

  // Lấy IP hiện tại
  private async getCurrentIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Khởi tạo activity monitoring
  private initializeActivityMonitoring(): void {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((event) => {
      document.addEventListener(event, () => this.updateActivity(), {
        passive: true,
      });
    });

    // Kiểm tra session định kỳ
    setInterval(() => {
      if (!this.isSessionValid()) {
        this.logout('Session validation failed');
      }
    }, this.checkInterval);
  }

  // Start activity timer
  private startActivityTimer(): void {
    this.resetActivityTimer();
  }

  // Reset activity timer
  private resetActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    this.activityTimer = setTimeout(() => {
      this.logout('Activity timeout');
    }, this.sessionTimeout);
  }

  // Log activity
  private logActivity(action: string, data?: Record<string, unknown>): void {
    if (!this.sessionData) return;

    const logData = {
      action,
      userId: this.sessionData.userId,
      email: this.sessionData.email,
      ipAddress: this.sessionData.ipAddress,
      deviceId: this.sessionData.deviceId,
      userAgent: this.sessionData.userAgent,
      timestamp: new Date().toISOString(),
      ...data,
    };

    // Enhanced logging with Google Sheets integration
    this.sendToGoogleSheets(logData);
    this.sendToSecurityAPI(logData);
  }

  // Send to Google Sheets via existing logService
  private async sendToGoogleSheets(
    logData: Record<string, unknown>
  ): Promise<void> {
    try {
      // Map SessionManager actions to logService actions
      const actionMap: Record<string, string> = {
        SESSION_STARTED: 'LOGIN_UI',
        SESSION_ENDED: 'LOGOUT_UI',
        ACTIVITY_TIMEOUT: 'SESSION_TIMEOUT',
        IP_CHANGED: 'SECURITY_IP_CHANGE',
        DEVICE_CHANGED: 'SECURITY_DEVICE_CHANGE',
      };

      const mappedAction =
        actionMap[logData.action as string] || (logData.action as string);

      // Import logService dynamically to avoid circular dependency
      const { logService } = await import('@/services/logService');

      await logService.write({
        userId: logData.userId as string,
        email: logData.email as string,
        action: mappedAction,
        resource: 'auth',
        details: `${logData.action as string}: ${(logData.reason as string) || 'System event'}`,
      });
    } catch (error) {
      console.warn('Failed to send to Google Sheets:', error);
    }
  }

  // Send to security API
  private sendToSecurityAPI(logData: Record<string, unknown>): void {
    try {
      fetch('/api/logs/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.sessionData?.token || ''}`,
        },
        body: JSON.stringify(logData),
      }).catch(console.error);
    } catch (error) {
      console.warn('Failed to send to security API:', error);
    }
  }

  // Getters
  public getToken(): string | null {
    return this.sessionData?.token || null;
  }

  public getUserId(): string | null {
    if (this.sessionData?.userId) return this.sessionData.userId;

    // Fallback to localStorage session
    try {
      const storedSession = localStorage.getItem('mia_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        return session.user?.id || null;
      }
    } catch (error) {
      console.warn('Failed to parse stored session for userId:', error);
    }
    return null;
  }

  public getEmail(): string | null {
    if (this.sessionData?.email) return this.sessionData.email;

    // Fallback to localStorage session
    try {
      const storedSession = localStorage.getItem('mia_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        return session.user?.email || null;
      }
    } catch (error) {
      console.warn('Failed to parse stored session for email:', error);
    }
    return null;
  }

  public getSessionInfo(): Partial<SessionData> | null {
    if (this.sessionData) {
      return {
        userId: this.sessionData.userId,
        email: this.sessionData.email,
        lastActivity: this.sessionData.lastActivity,
        deviceId: this.sessionData.deviceId,
      };
    }

    // Fallback to AuthService session
    try {
      const authToken =
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');
      const userData =
        localStorage.getItem('userData') || sessionStorage.getItem('userData');

      if (authToken && userData) {
        const user = JSON.parse(userData);
        console.log(
          '🔍 SessionManager.getSessionInfo: Found AuthService session:',
          {
            userId: user.id,
            email: user.email,
            hasUserId: !!user.id,
          }
        );
        return {
          userId: user.id || null,
          email: user.email || null,
          lastActivity: Date.now(), // Use current time as fallback
          deviceId: 'browser-device', // Fallback device ID
        };
      }
    } catch (error) {
      console.warn(
        'Failed to parse AuthService session for sessionInfo:',
        error
      );
    }

    // Fallback to localStorage session
    try {
      const storedSession = localStorage.getItem('mia_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        return {
          userId: session.user?.id || null,
          email: session.user?.email || null,
          lastActivity: session.ts || null,
          deviceId: undefined, // Not available in localStorage session
        };
      }
    } catch (error) {
      console.warn('Failed to parse stored session for sessionInfo:', error);
    }
    return null;
  }
}

export default SessionManager;
