// src/services/authService.ts
interface User {
  id: string;
  email: string;
  fullName?: string;
  roleId?: string;
}

interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  message?: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private token: string | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token && !!localStorage.getItem('authToken');
  }

  // Check if session is expired
  isSessionExpired(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return true;

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return tokenData.exp && tokenData.exp < now;
    } catch {
      return true;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const response = await fetch('/api/auth/roles');
      if (response.ok) {
        return { status: 'healthy', message: 'Server is running' };
      } else {
        return { status: 'unhealthy', message: 'Server error' };
      }
    } catch (error) {
      return { status: 'unhealthy', message: 'Connection failed' };
    }
  }

  // Login
  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResult> {
    try {
      console.log('🌐 Making API call to /api/auth/login');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      console.log('🌐 Response status:', response.status, response.statusText);
      const result = await response.json();
      console.log('🌐 Response data:', result);
      console.log('🌐 Response ok:', response.ok);
      console.log('🌐 Has result.id:', !!result.id);
      console.log('🌐 Has result.email:', !!result.email);

      if (response.ok && result.id && result.email) {
        // Backend returns user data directly, not wrapped in success object
        const user = {
          id: result.id,
          email: result.email,
          fullName: result.fullName,
          roleId: result.roleId,
          permissions: result.permissions || [],
        };

        // Create a simple token for session management
        const token = btoa(
          JSON.stringify({ userId: user.id, timestamp: Date.now() })
        );

        this.token = token;
        this.currentUser = user;

        if (rememberMe) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(user));
        } else {
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('userData', JSON.stringify(user));
        }

        return {
          success: true,
          user: user,
          token: token,
        };
      } else {
        return {
          success: false,
          message: result.error || result.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Logout
  logout(): void {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
  }

  // Initialize from stored data
  initialize(): void {
    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userData =
      localStorage.getItem('userData') || sessionStorage.getItem('userData');

    if (token && userData && !this.isSessionExpired()) {
      this.token = token;
      this.currentUser = JSON.parse(userData);
    } else {
      this.logout();
    }
  }
}

// Export singleton instance
export default AuthService.getInstance();
