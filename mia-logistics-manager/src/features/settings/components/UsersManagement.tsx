import React, { useState, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { StatCard } from '../../../shared/components/ui';
import { UsersTable } from './UsersTable';
import { Role, User } from '../../../shared/types/commonTypes';
import { logService } from '@/services/logService';
import { authService } from '../../../services/googleSheets/authService';
import { UserDialog } from './UserDialog';

interface UsersManagementProps {
  users: User[];
  roles: Role[];
  loading: boolean;
  onUsersChange: () => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  users,
  roles,
  loading,
  onUsersChange,
}) => {
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  }, []);

  const handleUserSubmit = async (
    userData: Partial<User> & { password?: string }
  ) => {
    try {
      if (userData.id) {
        await authService.updateUser(userData.id, userData);
        logService.write({
          action: 'USER_UPDATE',
          resource: 'users',
          details: JSON.stringify({ id: userData.id }),
        });
      } else {
        await authService.createUser(userData as any);
        logService.write({
          action: 'USER_CREATE',
          resource: 'users',
          details: JSON.stringify({ email: userData.email }),
        });
      }
      onUsersChange();
      return { success: true };
    } catch {
      return { success: false, error: 'Không thể lưu người dùng' };
    }
  };

  // Statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.status === 'active').length,
    inactiveUsers: users.filter((user) => user.status === 'inactive').length,
    usersWithRoles: users.filter(
      (user) => user.roleId && roles.find((r) => r.id === user.roleId)
    ).length,
  };

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TỔNG NGƯỜI DÙNG"
            value={stats.totalUsers}
            icon={<PersonIcon />}
            color="primary"
            change={{
              value: `${stats.totalUsers} người dùng trong hệ thống`,
              positive: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="NGƯỜI DÙNG HOẠT ĐỘNG"
            value={stats.activeUsers}
            icon={<CheckCircleIcon />}
            color="success"
            change={{
              value: `${((stats.activeUsers / (stats.totalUsers || 1)) * 100).toFixed(1)}% tổng số`,
              positive: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="NGƯỜI DÙNG KHÔNG HOẠT ĐỘNG"
            value={stats.inactiveUsers}
            icon={<WarningIcon />}
            color="warning"
            change={{
              value: `${((stats.inactiveUsers / (stats.totalUsers || 1)) * 100).toFixed(1)}% tổng số`,
              positive: false,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="CÓ VAI TRÒ"
            value={stats.usersWithRoles}
            icon={<GroupIcon />}
            color="info"
            change={{
              value: `${((stats.usersWithRoles / (stats.totalUsers || 1)) * 100).toFixed(1)}% tổng số`,
              positive: true,
            }}
          />
        </Grid>
      </Grid>

      {/* Users Table */}
      <Box sx={{ mb: 4 }}>
        <UsersTable
          users={users}
          roles={roles}
          loading={loading}
          onEdit={handleEditUser}
          onAdd={handleAddUser}
        />
      </Box>

      <UserDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        user={selectedUser}
        roles={roles}
        onSubmit={handleUserSubmit}
        title={selectedUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
      />
    </Box>
  );
};
