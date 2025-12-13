import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/components/Auth/AuthProvider';
import styles from './UserManagement.module.scss';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  loginAttempts: number;
  permissions: string[];
}

interface UserManagementProps {
  className?: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ className }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách users');
      }

      const data = await response.json();
      setUsers(data.data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle user status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái user');
      }

      // Update local state
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa user này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa user');
      }

      // Remove from local state
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className={`${styles.userManagement} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải danh sách users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.userManagement} ${className || ''}`}>
      <div className={styles.header}>
        <h2>👥 Quản lý Users</h2>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Tạo User Mới
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Tất cả Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="driver">Driver</option>
            <option value="customer">Customer</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>{users.length}</h3>
          <p>Tổng Users</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter(u => u.isActive).length}</h3>
          <p>Hoạt động</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter(u => u.isEmailVerified).length}</h3>
          <p>Đã xác thực Email</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter(u => u.role === 'admin').length}</h3>
          <p>Admins</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>👤 User</th>
              <th>📧 Email</th>
              <th>🔑 Role</th>
              <th>📱 Phone</th>
              <th>✅ Status</th>
              <th>📅 Tạo lúc</th>
              <th>🛠️ Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <div>
                      <strong>{user.firstName} {user.lastName}</strong>
                      {user.isEmailVerified && <span className={styles.verified}>✓</span>}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.role} ${styles[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.phone}</td>
                <td>
                  <span className={`${styles.status} ${user.isActive ? styles.active : styles.inactive}`}>
                    {user.isActive ? '🟢 Hoạt động' : '🔴 Không hoạt động'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className={styles.actions}>
                    <button 
                      className={styles.editBtn}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button 
                      className={`${styles.toggleBtn} ${user.isActive ? styles.deactivate : styles.activate}`}
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                    >
                      {user.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => deleteUser(user._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className={styles.noData}>
            <p>🔍 Không tìm thấy users nào</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo user');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>➕ Tạo User Mới</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.error}>
              <p>❌ {error}</p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>📧 Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>🔒 Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>👤 Tên *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>👤 Họ *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>📱 Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>🔑 Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" disabled={loading}>
              {loading ? '⏳ Đang tạo...' : '✅ Tạo User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ user, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật user');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>✏️ Chỉnh sửa User</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.error}>
              <p>❌ {error}</p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>📧 Email</label>
            <input type="email" value={user.email} disabled />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>👤 Tên *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>👤 Họ *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>📱 Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>🔑 Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              🟢 User hoạt động
            </label>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" disabled={loading}>
              {loading ? '⏳ Đang cập nhật...' : '✅ Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
