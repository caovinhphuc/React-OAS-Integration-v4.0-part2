import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/authService';

const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated && requiredPermission) {
        const permission = AuthService.hasPermission(requiredPermission);
        setHasPermission(permission);
      }
    };

    checkAuth();
  }, [requiredPermission]);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #ff6b35 0%, #ff9500 100%)',
        color: 'white',
        fontFamily: 'Inter, Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>🔐 Checking Authentication...</h2>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but no permission
  if (!hasPermission) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #ff6b35 0%, #ff9500 100%)',
        color: 'white',
        fontFamily: 'Inter, Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>🚫 Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Authenticated and has permission
  return children;
};

export default ProtectedRoute;
