import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/components/Auth/AuthProvider';
import styles from './SystemStats.module.scss';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByRole: Array<{ _id: string; count: number }>;
  recentLogins: number;
  systemUptime: string;
}

export const SystemStats: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Không thể tải thống kê');
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className={styles.systemStats}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.systemStats}>
        <div className={styles.error}>
          <p>❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.systemStats}>
      <div className={styles.header}>
        <h2>📊 Thống kê Hệ thống</h2>
        <p>Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Tổng Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🟢</div>
          <div className={styles.statContent}>
            <h3>{stats?.activeUsers || 0}</h3>
            <p>Users Hoạt động</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3>{stats?.verifiedUsers || 0}</h3>
            <p>Email Đã xác thực</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔐</div>
          <div className={styles.statContent}>
            <h3>{stats?.usersByRole?.length || 0}</h3>
            <p>Số Roles</p>
          </div>
        </div>
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3>📈 Phân bố Users theo Role</h3>
          <div className={styles.roleChart}>
            {stats?.usersByRole?.map(role => (
              <div key={role._id} className={styles.roleBar}>
                <div className={styles.roleLabel}>
                  <span className={styles.roleName}>{role._id}</span>
                  <span className={styles.roleCount}>{role.count}</span>
                </div>
                <div className={styles.roleProgress}>
                  <div 
                    className={styles.roleFill}
                    style={{ 
                      width: `${(role.count / (stats?.totalUsers || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>🕒 Thông tin Hệ thống</h3>
          <div className={styles.systemInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>🕐 Uptime:</span>
              <span className={styles.infoValue}>99.9%</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>💾 Database:</span>
              <span className={styles.infoValue}>MongoDB</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>🌐 Environment:</span>
              <span className={styles.infoValue}>Development</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>📅 Last Backup:</span>
              <span className={styles.infoValue}>Hôm nay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
