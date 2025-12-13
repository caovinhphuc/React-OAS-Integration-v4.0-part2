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
import { Role } from '../../shared/types/commonTypes';
import { authService } from '../../services/googleSheets/authService';
import { PermissionsManagement } from './components/PermissionsManagement';
import ModernPageLayout from '../../shared/components/layout/ModernPageLayout';

const AuthorizationPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rolesData = await authService.getRoles();
      setRoles(rolesData);
    } catch {
      setError('Không thể tải dữ liệu vai trò');
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
      title="QUẢN LÝ QUYỀN HẠN"
      subtitle="Cấu hình quyền hạn cho các vai trò"
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

      {/* Permissions Management */}
      <PermissionsManagement
        roles={roles}
        loading={loading}
        onRefresh={handleRefresh}
      />
    </ModernPageLayout>
  );
};

export default AuthorizationPermissions;
