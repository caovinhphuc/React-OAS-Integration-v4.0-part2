import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Role, User } from '../../shared/types/commonTypes';
import { authService } from '../../services/googleSheets/authService';
import { UsersManagement } from './components/UsersManagement';
import ModernPageLayout from '../../shared/components/layout/ModernPageLayout';

const AuthorizationUsers: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [rolesData, usersData] = await Promise.all([
        authService.getRoles(),
        authService.getUsers(),
      ]);
      setRoles(rolesData);
      setUsers(usersData);
    } catch {
      setError('Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleUsersChange = () => {
    fetchData();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ModernPageLayout
      title="QUẢN LÝ NGƯỜI DÙNG"
      subtitle="Quản lý tài khoản người dùng trong hệ thống"
      icon={<SecurityIcon />}
      actions={
        <Tooltip title="Làm mới dữ liệu">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      }
    >
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Management */}
      <UsersManagement
        users={users}
        roles={roles}
        loading={loading}
        onUsersChange={handleUsersChange}
      />
    </ModernPageLayout>
  );
};

export default AuthorizationUsers;
