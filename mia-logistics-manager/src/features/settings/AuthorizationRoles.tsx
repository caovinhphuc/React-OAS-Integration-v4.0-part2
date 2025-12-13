import React, { useState, useEffect, useCallback } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { Role } from '../../shared/types/commonTypes';
import { authService } from '../../services/googleSheets/authService';
import { RolesManagement } from './components/RolesManagement';

const AuthorizationRoles: React.FC = () => {
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
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Roles Management */}
      <RolesManagement
        roles={roles}
        loading={loading}
        onRolesChange={handleRefresh}
      />
    </Box>
  );
};

export default AuthorizationRoles;
