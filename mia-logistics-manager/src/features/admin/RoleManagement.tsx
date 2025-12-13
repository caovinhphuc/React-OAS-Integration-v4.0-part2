import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/components/Auth/AuthProvider';
import styles from './RoleManagement.module.scss';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export const RoleManagement: React.FC = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - will be replaced with API call
    setRoles([
      {
        id: 'admin',
        name: 'Admin',
        description: 'Full system access',
        permissions: [
          'read:users',
          'write:users',
          'delete:users',
          'read:orders',
          'write:orders',
          'delete:orders',
        ],
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Management access',
        permissions: ['read:users', 'read:orders', 'write:orders'],
      },
      {
        id: 'driver',
        name: 'Driver',
        description: 'Driver access',
        permissions: ['read:orders', 'update:orders'],
      },
      {
        id: 'customer',
        name: 'Customer',
        description: 'Customer access',
        permissions: ['read:orders', 'write:orders'],
      },
    ]);
    setLoading(false);
  }, [token]);

  if (loading) {
    return (
      <div className={styles.roleManagement}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải danh sách roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.roleManagement}>
      <div className={styles.header}>
        <h2>🔐 Quản lý Roles</h2>
        <button className={styles.createButton}>➕ Tạo Role Mới</button>
      </div>

      {error && (
        <div className={styles.error}>
          <p>❌ {error}</p>
        </div>
      )}

      <div className={styles.rolesGrid}>
        {roles.map((role) => (
          <div key={role.id} className={styles.roleCard}>
            <div className={styles.roleHeader}>
              <h3>{role.name}</h3>
              <span className={styles.roleId}>{role.id}</span>
            </div>
            <p className={styles.roleDescription}>{role.description}</p>
            <div className={styles.permissions}>
              <h4>Permissions:</h4>
              <div className={styles.permissionList}>
                {role.permissions.map((permission) => (
                  <span key={permission} className={styles.permission}>
                    {permission}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.roleActions}>
              <button className={styles.editBtn}>✏️ Chỉnh sửa</button>
              <button className={styles.deleteBtn}>🗑️ Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;
