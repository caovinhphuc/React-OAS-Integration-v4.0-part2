import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/components/Auth/AuthProvider';
import { UserManagement } from './UserManagement';
import { RoleManagement } from './RoleManagement';
import { SystemStats } from './SystemStats';
import { AuditLogs } from './AuditLogs';
import styles from './AdminDashboard.module.scss';

interface AdminDashboardProps {
  className?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  className,
}) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Bạn không có quyền truy cập trang quản trị');
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className={`${styles.adminDashboard} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.adminDashboard} ${className || ''}`}>
        <div className={styles.error}>
          <h2>❌ Lỗi truy cập</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: '👥 Quản lý Users', component: UserManagement },
    { id: 'roles', label: '🔐 Quản lý Roles', component: RoleManagement },
    { id: 'stats', label: '📊 Thống kê', component: SystemStats },
    { id: 'logs', label: '📝 Audit Logs', component: AuditLogs },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || UserManagement;

  return (
    <div className={`${styles.adminDashboard} ${className || ''}`}>
      <div className={styles.header}>
        <h1>🛡️ Admin Panel</h1>
        <p>Quản lý hệ thống MIA Logistics Manager</p>
        <div className={styles.userInfo}>
          <span>
            👤 {user?.firstName} {user?.lastName}
          </span>
          <span>🔑 {user?.role}</span>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <ActiveComponent />
      </div>
    </div>
  );
};

export default AdminDashboard;
