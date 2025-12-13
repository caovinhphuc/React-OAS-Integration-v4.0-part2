import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
import { RolesManagement } from './components/RolesManagement';
import { UsersManagement } from './components/UsersManagement';
import { PermissionsManagement } from './components/PermissionsManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AuthorizationManagementComponent: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
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
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleRolesChange = () => {
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              QUẢN LÝ PHÂN QUYỀN HỆ THỐNG
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý vai trò, quyền hạn và người dùng
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
            },
            '& .Mui-selected': {
              color: 'primary.main',
            },
          }}
        >
          <Tab label="Vai trò" />
          <Tab label="Quyền" />
          <Tab label="Người dùng" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <RolesManagement
          roles={roles}
          loading={loading}
          onRefresh={handleRefresh}
          onRolesChange={handleRolesChange}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <PermissionsManagement
          roles={roles}
          loading={loading}
          onRefresh={handleRefresh}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <UsersManagement
          users={users}
          roles={roles}
          loading={loading}
          onRefresh={handleRefresh}
          onUsersChange={handleUsersChange}
        />
      </TabPanel>
    </Box>
  );
};

export const AuthorizationManagement = AuthorizationManagementComponent;
