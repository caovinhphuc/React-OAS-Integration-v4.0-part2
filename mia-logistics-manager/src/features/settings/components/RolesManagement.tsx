import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import {
  EnhancedTable,
  StatCard,
  ActionButton,
} from '../../../shared/components/ui';
import { Role } from '../../../shared/types/commonTypes';
import { authService } from '../../../services/googleSheets/authService';
import { RoleDialog } from './RoleDialog';

interface RolesManagementProps {
  roles: Role[];
  loading: boolean;
  onRolesChange: () => void;
}

export const RolesManagement: React.FC<RolesManagementProps> = ({
  roles,
  loading,
  onRolesChange,
}) => {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Roles table columns
  const roleColumns = [
    {
      id: 'name',
      label: 'TÊN VAI TRÒ',
      sortable: true,
      render: (_value: unknown, role: Role) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            <GroupIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              {role.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {role.id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'MÔ TẢ',
      sortable: true,
      render: (_value: unknown, role: Role) => (
        <Typography variant="body2" color="text.secondary">
          {role.description || 'Chưa có mô tả'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'THAO TÁC',
      sortable: false,
      render: (_value: unknown, role: Role) => (
        <Tooltip title="Chỉnh sửa vai trò">
          <IconButton
            size="small"
            onClick={() => handleEditRole(role)}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.50',
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const handleAddRole = useCallback(() => {
    setSelectedRole(null);
    setRoleDialogOpen(true);
  }, []);

  const handleEditRole = useCallback((role: Role) => {
    setSelectedRole(role);
    setRoleDialogOpen(true);
  }, []);

  const handleRoleSubmit = useCallback(
    async (roleData: Role | Omit<Role, 'id'>) => {
      try {
        if (selectedRole) {
          // Update existing role
          await authService.updateRole(selectedRole);
          console.log('Role updated successfully', {
            roleId: selectedRole.id,
          });
          onRolesChange();
          setRoleDialogOpen(false);
          setSelectedRole(null);
          return { success: true };
        } else {
          // Create new role
          await authService.createRole(roleData as Omit<Role, 'id'>);
          console.log('Role created successfully', { roleData });
          onRolesChange();
          setRoleDialogOpen(false);
          setSelectedRole(null);
          return { success: true };
        }
      } catch (error) {
        console.error('Failed to save role', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [selectedRole, onRolesChange]
  );
  // Calculate statistics
  const stats = {
    totalRoles: roles.length,
    activeRoles: roles.length, // Assuming all roles are active
    rolesWithDescription: roles.filter(
      (role) => role.description && role.description.trim()
    ).length,
    rolesWithoutDescription: roles.filter(
      (role) => !role.description || !role.description.trim()
    ).length,
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TỔNG VAI TRÒ"
            value={stats.totalRoles}
            icon={<GroupIcon />}
            color="primary"
            change={{
              value: `${stats.totalRoles} vai trò trong hệ thống`,
              positive: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="VAI TRÒ HOẠT ĐỘNG"
            value={stats.activeRoles}
            icon={<GroupIcon />}
            color="success"
            change={{
              value: `${((stats.activeRoles / (stats.totalRoles || 1)) * 100).toFixed(1)}% tổng số`,
              positive: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="CÓ MÔ TẢ"
            value={stats.rolesWithDescription}
            icon={<GroupIcon />}
            color="info"
            change={{
              value: `${((stats.rolesWithDescription / (stats.totalRoles || 1)) * 100).toFixed(1)}% tổng số`,
              positive: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="THIẾU MÔ TẢ"
            value={stats.rolesWithoutDescription}
            icon={<GroupIcon />}
            color="warning"
            change={{
              value: `${((stats.rolesWithoutDescription / (stats.totalRoles || 1)) * 100).toFixed(1)}% tổng số`,
              positive: false,
            }}
          />
        </Grid>
      </Grid>

      {/* Main Data Table */}
      <EnhancedTable
        columns={roleColumns}
        data={roles}
        loading={loading}
        emptyMessage="Không có vai trò nào"
        onEdit={handleEditRole}
        title="Danh sách vai trò"
        subtitle="Quản lý và theo dõi các vai trò trong hệ thống"
        actions={
          <ActionButton
            variant="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRole}
          >
            Thêm vai trò
          </ActionButton>
        }
      />

      <RoleDialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        role={selectedRole}
        onSubmit={handleRoleSubmit}
        title={selectedRole ? 'Sửa vai trò' : 'Thêm vai trò mới'}
      />
    </Box>
  );
};
