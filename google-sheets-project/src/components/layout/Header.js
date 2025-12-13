import { useNavigate } from "react-router-dom";
import AuthService from "../../services/authService";
import "./Header.css";

const Header = ({ user, showUserInfo = false, configValid = true }) => {
  const navigate = useNavigate();

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <h1>📊 Google Integration</h1>
        </div>
        
        <div className="header-actions">
          <div className="header-info">
            <span className="time-display">🕒 {getCurrentTime()}</span>
            <div className={`status-indicator ${configValid ? 'online' : 'warning'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {configValid ? 'Online' : 'Config'}
              </span>
            </div>
          </div>
          
          {showUserInfo && user && (
            <div className="user-section">
              <span className="user-greeting">{user.fullName || "User"}</span>
              <button
                className="logout-btn"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
