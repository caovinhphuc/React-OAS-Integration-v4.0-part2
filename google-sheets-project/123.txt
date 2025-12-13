import {
  Suspense,
  createContext,
  lazy,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ModuleErrorBoundary from './components/ErrorBoundary';

// ==================== PERFORMANCE MONITORING ====================
import { useErrorHandler } from './utils/useErrorHandler';
import { usePerformanceMonitor } from './utils/usePerformanceMonitor';

// ==================== CONTEXT PROVIDERS ====================
import { MetricsProvider } from './utils/MetricsContext';
import { WebSocketProvider } from './utils/WebSocketContext';

// ==================== SHARED COMPONENTS ====================
import MainLayout from './components/MainLayout';
import { ErrorFallback, LoadingSpinner, NetworkStatus } from './components/SharedComponentsApp';
import { NotificationContainer } from './shared/hooks/NotificationContainer';
import { NotificationProvider } from './shared/hooks/useNotification';

// ==================== THEME SYSTEM ====================
import { getThemeClasses } from './shared/constants/theme';

// ==================== LAZY LOAD MODULES (OPTIMIZED) ====================
const OrdersModule = lazy(() =>
  import('./modules/orders').catch(() => ({
    default: () => <div className="p-4">Error loading Orders module</div>,
  })),
);
const AlertsModule = lazy(() =>
  import('./modules/alerts').catch(() => ({
    default: () => <div className="p-4">Error loading Alerts module</div>,
  })),
);
const PickingModule = lazy(() =>
  import('./modules/picking').catch(() => ({
    default: () => <div className="p-4">Error loading Picking module</div>,
  })),
);
const AnalyticsModule = lazy(() =>
  import('./modules/analytics').catch(() => ({
    default: () => <div className="p-4">Error loading Analytics module</div>,
  })),
);
const InventoryModule = lazy(() =>
  import('./modules/inventory').catch(() => ({
    default: () => <div className="p-4">Error loading Inventory module</div>,
  })),
);
const StaffModule = lazy(() =>
  import('./modules/staff').catch(() => ({
    default: () => <div className="p-4">Error loading Staff module</div>,
  })),
);
const DashboardModule = lazy(() =>
  import('./modules/dashboard').catch(() => ({
    default: () => <div className="p-4">Error loading Dashboard module</div>,
  })),
);
const UserManagementPage = lazy(() =>
  import('./pages/UserManagement').catch(() => ({
    default: () => <div className="p-4">Error loading User Management page</div>,
  })),
);
const UserProfilePage = lazy(() =>
  import('./pages/UserProfile').catch(() => ({
    default: () => <div className="p-4">Error loading User Profile page</div>,
  })),
);
const LoginPage = lazy(() =>
  import('./pages/Login').catch(() => ({
    default: () => <div className="p-4">Error loading Login page</div>,
  })),
);
const SettingsPage = lazy(() =>
  import('./pages/Settings').catch(() => ({
    default: () => <div className="p-4">Error loading Settings page</div>,
  })),
);
const WarehouseMapModule = lazy(() =>
  import('./modules/warehouse-map').catch(() => ({
    default: () => <div className="p-4">Error loading Warehouse Map module</div>,
  })),
);
const ShippingSLAModule = lazy(() =>
  import('./modules/shippingsla').catch(() => ({
    default: () => <div className="p-4">Error loading Shipping SLA module</div>,
  })),
);
const AutomationModule = lazy(() =>
  import('./modules/automation').catch(() => ({
    default: () => <div className="p-4">Error loading Automation module</div>,
  })),
);
const GoogleSheetsDataViewer = lazy(() =>
  import('./components/GoogleSheetsDataViewer').catch(() => ({
    default: () => <div className="p-4">Error loading Google Sheets Data Viewer</div>,
  })),
);
const EnhancedUserProfile = lazy(() =>
  import('./components/EnhancedUserProfile').catch(() => ({
    default: () => <div className="p-4">Error loading Enhanced User Profile</div>,
  })),
);

// ==================== CONTEXT DEFINITIONS ====================
const ThemeContext = createContext();
const AuthContext = createContext();
const AppStateContext = createContext();

// ==================== CUSTOM HOOKS ====================
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// ==================== THEME PROVIDER (OPTIMIZED) ====================
const ThemeProvider = memo(({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('mia-warehouse-theme');
      if (saved) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.warn('Error reading theme preference:', error);
      return false;
    }
  });

  // Optimized theme application
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      if (isDarkMode) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(applyTheme);

    // Save preference
    try {
      localStorage.setItem('mia-warehouse-theme', JSON.stringify(isDarkMode));
    } catch (error) {
      console.warn('Error saving theme preference:', error);
    }
  }, [isDarkMode]);

  // System theme change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('mia-warehouse-theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const themeClasses = useMemo(() => getThemeClasses(isDarkMode), [isDarkMode]);

  const themeValue = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      setIsDarkMode,
      themeClasses,
    }),
    [isDarkMode, toggleTheme, themeClasses],
  );

  return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
});

ThemeProvider.displayName = 'ThemeProvider';

// ==================== AUTH PROVIDER (ENHANCED) ====================
const AuthProvider = memo(({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useErrorHandler();

  // Enhanced authentication check
  const checkAuthStatus = useCallback(async () => {
    try {
      const token =
        sessionStorage.getItem('authToken') || localStorage.getItem('mia-warehouse-token');
      const storedUser =
        localStorage.getItem('currentUser') || localStorage.getItem('mia-warehouse-user');

      if (token && storedUser) {
        const userData = JSON.parse(storedUser);

        // Validate user data structure
        if (userData && typeof userData === 'object') {
          userData.lastLogin = new Date();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid user data format');
        }
      }
    } catch (error) {
      handleError(error, 'Authentication check failed');
      // Clear invalid auth data
      ['mia-warehouse-token', 'mia-warehouse-user', 'currentUser', 'authToken'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      const authKeys = ['authToken', 'currentUser', 'mia-warehouse-token', 'mia-warehouse-user'];
      if (authKeys.includes(e.key)) {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  // Enhanced login with retry logic
  const login = useCallback(
    async (credentials, retryCount = 0) => {
      const MAX_RETRIES = 3;

      try {
        setIsLoading(true);

        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbwQdC5ZTkD71xEDWPApkkbp5oyS7M4ijwmcCFKAtYqin75dssevjkfFgpEq1O2Xyils/exec',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              ...credentials,
              timestamp: new Date().toISOString(),
            }),
            signal: AbortSignal.timeout(15000), // 15 second timeout
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.user) {
          // Enhanced user data with security
          const enhancedUser = {
            ...result.user,
            loginTime: new Date().toISOString(),
            sessionId: crypto.randomUUID?.() || Date.now().toString(),
          };

          localStorage.setItem('mia-warehouse-token', 'dummy-token');
          localStorage.setItem('mia-warehouse-user', JSON.stringify(enhancedUser));
          sessionStorage.setItem('authToken', 'session-token');

          setUser(enhancedUser);
          setIsAuthenticated(true);

          return { success: true, user: enhancedUser };
        } else {
          throw new Error(result.message || 'Invalid credentials');
        }
      } catch (error) {
        // Retry logic for network errors
        if (retryCount < MAX_RETRIES && error.name === 'NetworkError') {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
          return login(credentials, retryCount + 1);
        }

        handleError(error, 'Login failed');
        return {
          success: false,
          error: error.message,
          retryAttempt: retryCount,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [handleError],
  );

  // Enhanced logout with cleanup
  const logout = useCallback(async () => {
    try {
      // Audit logging before cleanup
      if (user) {
        try {
          const { logAuditEvent } = await import('./services/googleSheetsAuth');
          await logAuditEvent({
            action: 'LOGOUT',
            username: user.email || user.name || 'unknown',
            details: 'User logged out',
            status: 'SUCCESS',
            ipAddress: 'local',
            sessionId: user.sessionId,
          });
        } catch (auditError) {
          console.warn('Audit logging failed:', auditError);
        }
      }

      // Comprehensive cleanup
      const keysToRemove = [
        'mia-warehouse-token',
        'mia-warehouse-user',
        'currentUser',
        'authToken',
        'loginTime',
        'rememberedUsername',
        'loginBlock',
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Clear state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      handleError(error, 'Logout error');
    }
  }, [user, handleError]);

  const authValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      checkAuthStatus,
    }),
    [user, isAuthenticated, isLoading, login, logout, checkAuthStatus],
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
});

AuthProvider.displayName = 'AuthProvider';

// ==================== APP STATE PROVIDER (ENHANCED) ====================
const AppStateProvider = memo(({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pageLoadTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
  });

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification) => {
      const id = crypto.randomUUID?.() || Date.now().toString();
      const newNotification = {
        ...notification,
        id,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]); // Keep last 50

      // Auto-remove non-critical notifications
      if (!['error', 'critical'].includes(notification.type)) {
        const timeout = notification.type === 'warning' ? 8000 : 5000;
        setTimeout(() => removeNotification(id), timeout);
      }

      return id;
    },
    [removeNotification],
  );

  // Enhanced system health monitoring
  useEffect(() => {
    let healthCheckInterval;
    let performanceInterval;

    const checkSystemHealth = async () => {
      const startTime = performance.now();

      try {
        // Network connectivity check
        const isOnline = navigator.onLine;

        // Performance API usage monitoring
        if (performance.memory) {
          setPerformanceMetrics((prev) => ({
            ...prev,
            memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          }));
        }

        // Network latency check (simplified)
        if (isOnline) {
          try {
            await fetch('/favicon.ico', {
              method: 'HEAD',
              cache: 'no-cache',
            });
            const latency = performance.now() - startTime;
            setPerformanceMetrics((prev) => ({
              ...prev,
              networkLatency: Math.round(latency),
            }));
          } catch (error) {
            console.warn('Network latency check failed:', error);
          }
        }

        // Update connection status
        const newStatus = isOnline ? 'connected' : 'disconnected';
        if (connectionStatus !== newStatus) {
          setConnectionStatus(newStatus);

          if (!isOnline) {
            addNotification({
              type: 'warning',
              title: 'Connection Lost',
              message: 'Internet connection lost. Working in offline mode.',
              persistent: true,
            });
          } else {
            addNotification({
              type: 'success',
              title: 'Connection Restored',
              message: 'Internet connection restored.',
            });
          }
        }

        // System health assessment
        const memoryThreshold = 100; // MB
        const latencyThreshold = 1000; // ms

        let healthStatus = 'healthy';
        if (
          performanceMetrics.memoryUsage > memoryThreshold ||
          performanceMetrics.networkLatency > latencyThreshold
        ) {
          healthStatus = 'degraded';
        }

        if (systemStatus !== healthStatus) {
          setSystemStatus(healthStatus);
        }
      } catch (error) {
        console.warn('System health check failed:', error);
        setSystemStatus('degraded');
      }
    };

    // Initial check
    checkSystemHealth();

    // Set up intervals
    healthCheckInterval = setInterval(checkSystemHealth, 30000); // 30 seconds
    performanceInterval = setInterval(() => {
      if (performance.memory) {
        setPerformanceMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        }));
      }
    }, 10000); // 10 seconds

    // Event listeners
    window.addEventListener('online', checkSystemHealth);
    window.addEventListener('offline', checkSystemHealth);

    return () => {
      clearInterval(healthCheckInterval);
      clearInterval(performanceInterval);
      window.removeEventListener('online', checkSystemHealth);
      window.removeEventListener('offline', checkSystemHealth);
    };
  }, [
    connectionStatus,
    systemStatus,
    performanceMetrics.memoryUsage,
    performanceMetrics.networkLatency,
    addNotification,
  ]);

  const appStateValue = useMemo(
    () => ({
      notifications,
      systemStatus,
      connectionStatus,
      performanceMetrics,
      addNotification,
      removeNotification,
      setNotifications,
    }),
    [
      notifications,
      systemStatus,
      connectionStatus,
      performanceMetrics,
      addNotification,
      removeNotification,
    ],
  );

  return <AppStateContext.Provider value={appStateValue}>{children}</AppStateContext.Provider>;
});

AppStateProvider.displayName = 'AppStateProvider';

// ==================== PROTECTED ROUTE (OPTIMIZED) ====================
const ProtectedRoute = memo(({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
});

ProtectedRoute.displayName = 'ProtectedRoute';

// ==================== MODULE LOADING FALLBACK ====================
const ModuleLoadingFallback = memo(({ moduleName }) => (
  <div className="flex flex-col items-center justify-center min-h-96 p-8">
    <LoadingSpinner size="large" />
    <div className="mt-4 text-center">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Loading {moduleName}...
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Please wait while we prepare the module for you.
      </p>
    </div>
  </div>
));

ModuleLoadingFallback.displayName = 'ModuleLoadingFallback';

// ==================== MAIN APP COMPONENT (OPTIMIZED) ====================
const App = memo(() => {
  const performanceMonitor = usePerformanceMonitor();

  // Track app initialization
  useEffect(() => {
    const initTime = performance.now();
    performanceMonitor.recordMetric('app_init_time', initTime);
  }, [performanceMonitor]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Enhanced error logging
        console.error('App Error:', error, errorInfo);

        // Send to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
          // Example: Send to error tracking service
          // errorTrackingService.captureException(error, errorInfo);
        }
      }}
    >
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppStateProvider>
                <MetricsProvider>
                  <WebSocketProvider>
                    {/* Global Components */}
                    <NotificationContainer />
                    <NetworkStatus />

                    {/* Routes */}
                    <Routes>
                      {/* Public Routes */}
                      <Route
                        path="/login"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <LoadingSpinner size="large" />
                              </div>
                            }
                          >
                            <LoginPage />
                          </Suspense>
                        }
                      />

                      {/* Protected Routes */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <MainLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Navigate to="/dashboard" replace />} />

                        <Route
                          path="dashboard"
                          element={
                            <Suspense fallback={<ModuleLoadingFallback moduleName="Dashboard" />}>
                              <DashboardModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="orders/*"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Orders Management" />}
                            >
                              <OrdersModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="alerts/*"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Real-time Alerts" />}
                            >
                              <AlertsModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="picking/*"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Smart Picking" />}
                            >
                              <PickingModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="analytics/*"
                          element={
                            <ModuleErrorBoundary>
                              <Suspense
                                fallback={
                                  <ModuleLoadingFallback moduleName="Analytics & Reports" />
                                }
                              >
                                <AnalyticsModule />
                              </Suspense>
                            </ModuleErrorBoundary>
                          }
                        />

                        <Route
                          path="inventory/*"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Inventory Management" />}
                            >
                              <InventoryModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="staff/*"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Staff Management" />}
                            >
                              <StaffModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="warehouse-map/*"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Warehouse Map" />}
                            >
                              <WarehouseMapModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="shippingsla/*"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Hệ Thống SLA" />}
                            >
                              <ShippingSLAModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="automation/*"
                          element={
                            <Suspense fallback={<ModuleLoadingFallback moduleName="Automation" />}>
                              <AutomationModule />
                            </Suspense>
                          }
                        />

                        <Route
                          path="users"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="User Management" />}
                            >
                              <UserManagementPage />
                            </Suspense>
                          }
                        />

                        <Route
                          path="profile"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="User Profile" />}
                            >
                              <UserProfilePage />
                            </Suspense>
                          }
                        />

                        <Route
                          path="settings"
                          element={
                            <Suspense fallback={<ModuleLoadingFallback moduleName="Settings" />}>
                              <SettingsPage />
                            </Suspense>
                          }
                        />

                        <Route
                          path="google-sheets-data"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Google Sheets Data" />}
                            >
                              <GoogleSheetsDataViewer />
                            </Suspense>
                          }
                        />

                        <Route
                          path="enhanced-profile"
                          element={
                            <Suspense
                              fallback={<ModuleLoadingFallback moduleName="Enhanced Profile" />}
                            >
                              <EnhancedUserProfile />
                            </Suspense>
                          }
                        />
                      </Route>

                      {/* Catch All Route */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </WebSocketProvider>
                </MetricsProvider>
              </AppStateProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

// Export hooks for external use
export { useAppState, useAuth, useTheme };

export default App;
