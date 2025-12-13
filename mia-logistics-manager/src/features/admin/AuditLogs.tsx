import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/components/Auth/AuthProvider';
import styles from './AuditLogs.module.scss';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  userAgent: string;
}

export const AuditLogs: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data for now - will be replaced with API call
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        user: 'admin@mia.vn',
        action: 'LOGIN',
        resource: 'Authentication',
        details: 'User logged in successfully',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'test@mia-logistics.com',
        action: 'CREATE',
        resource: 'User',
        details: 'New user created',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: 'admin@mia.vn',
        action: 'UPDATE',
        resource: 'User',
        details: 'User role updated to admin',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    ];

    setLogs(mockLogs);
    setLoading(false);
  }, [token]);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'all' || log.action === filter;
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return '🔐';
      case 'LOGOUT':
        return '🚪';
      case 'CREATE':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      case 'READ':
        return '👁️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return '#48bb78';
      case 'LOGOUT':
        return '#ed8936';
      case 'CREATE':
        return '#4299e1';
      case 'UPDATE':
        return '#9f7aea';
      case 'DELETE':
        return '#f56565';
      case 'READ':
        return '#38b2ac';
      default:
        return '#718096';
    }
  };

  if (loading) {
    return (
      <div className={styles.auditLogs}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.auditLogs}>
      <div className={styles.header}>
        <h2>📝 Audit Logs</h2>
        <p>Lịch sử hoạt động của hệ thống</p>
      </div>

      {error && (
        <div className={styles.error}>
          <p>❌ {error}</p>
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả Actions</option>
            <option value="LOGIN">🔐 Login</option>
            <option value="LOGOUT">🚪 Logout</option>
            <option value="CREATE">➕ Create</option>
            <option value="UPDATE">✏️ Update</option>
            <option value="DELETE">🗑️ Delete</option>
            <option value="READ">👁️ Read</option>
          </select>
        </div>
      </div>

      <div className={styles.logsContainer}>
        <div className={styles.logsTable}>
          <div className={styles.logsHeader}>
            <div className={styles.logCell}>⏰ Thời gian</div>
            <div className={styles.logCell}>👤 User</div>
            <div className={styles.logCell}>🎯 Action</div>
            <div className={styles.logCell}>📄 Resource</div>
            <div className={styles.logCell}>📝 Chi tiết</div>
            <div className={styles.logCell}>🌐 IP</div>
          </div>

          {filteredLogs.map((log) => (
            <div key={log.id} className={styles.logRow}>
              <div className={styles.logCell}>
                <span className={styles.timestamp}>
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className={styles.logCell}>
                <span className={styles.user}>{log.user}</span>
              </div>
              <div className={styles.logCell}>
                <span
                  className={styles.action}
                  style={{ color: getActionColor(log.action) }}
                >
                  {getActionIcon(log.action)} {log.action}
                </span>
              </div>
              <div className={styles.logCell}>
                <span className={styles.resource}>{log.resource}</span>
              </div>
              <div className={styles.logCell}>
                <span className={styles.details}>{log.details}</span>
              </div>
              <div className={styles.logCell}>
                <span className={styles.ip}>{log.ip}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className={styles.noData}>
            <p>🔍 Không tìm thấy logs nào</p>
          </div>
        )}
      </div>

      <div className={styles.pagination}>
        <button className={styles.paginationBtn} disabled>
          ⬅️ Trước
        </button>
        <span className={styles.pageInfo}>Trang 1 / 1</span>
        <button className={styles.paginationBtn} disabled>
          Sau ➡️
        </button>
      </div>
    </div>
  );
};

export default AuditLogs;
