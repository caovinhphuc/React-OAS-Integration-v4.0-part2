import { useEffect, useState } from "react";
import AlertTest from "../components/AlertTest";
import GoogleDriveTest from "../components/GoogleDriveTest";
import GoogleSheetsTest from "../components/GoogleSheetsTest";
import ReportDashboard from "../components/ReportDashboard";
import MainLayout from "../components/layout/MainLayout";
import { useConfigValidation } from "../hooks/useConfigValidation";
import AuthService from "../services/authService";
import "./Dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const { configValid } = useConfigValidation();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const tabs = [
    {
      id: "dashboard",
      label: "🏠 Dashboard",
      component: null,
      permission: null,
    },
    {
      id: "sheets",
      label: "📊 Google Sheets",
      component: GoogleSheetsTest,
      permission: "read",
    },
    {
      id: "drive",
      label: "📁 Google Drive",
      component: GoogleDriveTest,
      permission: "write",
    },
    {
      id: "alerts",
      label: "🔔 Alerts",
      component: AlertTest,
      permission: "manage",
    },
    {
      id: "reports",
      label: "📈 Reports",
      component: ReportDashboard,
      permission: "read",
    },
  ];

  const availableTabs = tabs.filter(
    (tab) => !tab.permission || AuthService.hasPermission(tab.permission)
  );

  const ActiveComponent = availableTabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <MainLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      configValid={configValid}
      user={user}
      showUserInfo={true}
    >
      {/* Main Content */}
      <div className="dashboard-content">
        {activeTab === 'dashboard' ? (
          <div className="dashboard-home">
            {/* Hero Section */}
            <div className="dashboard-hero">
              <div className="hero-icon">🏢</div>
              <h1>MIA.vn</h1>
              <p>Nền tảng quản lý kinh doanh thông minh với tích hợp Google APIs. Đơn giản hóa quy trình làm việc và tối ưu hóa hiệu suất doanh nghiệp.</p>
            </div>
          </div>
        ) : (
          ActiveComponent && <ActiveComponent />
        )}
      </div>

      {/* User info footer */}
      <div className="dashboard-user-footer">
        <p>
          🔒 Đã đăng nhập: <strong>{user?.email}</strong> | 
          Quyền: <strong>{user?.permissions?.join(", ") || "Không có"}</strong>
        </p>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
