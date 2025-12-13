import googleConfig from "../config/googleConfig";

class AuthService {
  constructor() {
    this.baseUrl = googleConfig.api_base_url;
    this.currentUser = null;
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error("Server connection failed");
    }
  }

  // Đăng nhập với Google Sheets làm database
  async login(email, password, rememberMe = false) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Lưu thông tin user vào localStorage/sessionStorage
        const storage = rememberMe ? localStorage : sessionStorage;
        
        const loginData = {
          user: data.user,
          token: data.token || this.generateSessionToken(),
          loginTime: Date.now(),
          rememberMe: rememberMe
        };

        storage.setItem("authData", JSON.stringify(loginData));
        this.currentUser = data.user;

        return {
          success: true,
          user: data.user,
          message: "Đăng nhập thành công"
        };
      } else {
        return {
          success: false,
          error: data.error || "Thông tin đăng nhập không chính xác"
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Không thể kết nối tới server. Vui lòng thử lại."
      };
    }
  }

  // Đăng xuất
  logout() {
    localStorage.removeItem("authData");
    sessionStorage.removeItem("authData");
    this.currentUser = null;
    
    // Clear login attempts
    localStorage.removeItem("loginAttempts");
    localStorage.removeItem("lockoutTime");
  }

  // Kiểm tra trạng thái đăng nhập
  isAuthenticated() {
    const authData = this.getAuthData();
    
    if (!authData) {
      return false;
    }

    // Kiểm tra session timeout
    if (this.isSessionExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  // Kiểm tra session đã hết hạn chưa
  isSessionExpired() {
    const authData = this.getAuthData();
    
    if (!authData) {
      return true;
    }

    const { loginTime, rememberMe } = authData;
    const sessionDuration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : this.sessionTimeout; // 7 days if remember me
    
    return Date.now() - loginTime > sessionDuration;
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const authData = this.getAuthData();
    if (authData && !this.isSessionExpired()) {
      this.currentUser = authData.user;
      return this.currentUser;
    }

    return null;
  }

  // Lấy auth data từ storage
  getAuthData() {
    // Ưu tiên localStorage trước, sau đó sessionStorage
    let authData = localStorage.getItem("authData");
    if (!authData) {
      authData = sessionStorage.getItem("authData");
    }

    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (error) {
        console.error("Error parsing auth data:", error);
        return null;
      }
    }

    return null;
  }

  // Tạo session token đơn giản
  generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Kiểm tra quyền truy cập (role-based)
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }

    // Kiểm tra role và permissions
    const userRole = user.role || 'user';
    const permissions = user.permissions || [];

    // Admin có tất cả quyền
    if (userRole === 'admin') {
      return true;
    }

    // Kiểm tra specific permission
    return permissions.includes(permission);
  }

  // Refresh session (extend session time)
  refreshSession() {
    const authData = this.getAuthData();
    if (authData) {
      authData.loginTime = Date.now();
      const storage = authData.rememberMe ? localStorage : sessionStorage;
      storage.setItem("authData", JSON.stringify(authData));
    }
  }
}

// Export single instance
const authService = new AuthService();
export default authService;
