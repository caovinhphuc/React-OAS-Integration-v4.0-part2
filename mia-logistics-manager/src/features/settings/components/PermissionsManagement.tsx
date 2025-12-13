import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  StatCard,
  ActionButton,
  ModernCard,
} from '../../../shared/components/ui';
import { Role } from '../../../shared/types/commonTypes';
import { authService } from '../../../services/googleSheets/authService';

interface Permission {
  resource: string;
  action: string;
  label: string;
}

interface RolePermission {
  roleId: string;
  resource: string;
  action: string;
}

interface PermissionsManagementProps {
  roles: Role[];
  loading: boolean;
  onRefresh: () => void;
}

// Available permissions
const AVAILABLE_PERMISSIONS: Permission[] = [
  // Employees
  { resource: 'employees', action: 'view', label: 'Xem nhân viên' },
  { resource: 'employees', action: 'create', label: 'Tạo nhân viên' },
  { resource: 'employees', action: 'update', label: 'Sửa nhân viên' },
  { resource: 'employees', action: 'delete', label: 'Xóa nhân viên' },

  // Transfers
  { resource: 'transfers', action: 'view', label: 'Xem phiếu chuyển kho' },
  { resource: 'transfers', action: 'create', label: 'Tạo phiếu chuyển kho' },
  { resource: 'transfers', action: 'update', label: 'Sửa phiếu chuyển kho' },
  { resource: 'transfers', action: 'delete', label: 'Xóa phiếu chuyển kho' },

  // Carriers
  { resource: 'carriers', action: 'view', label: 'Xem nhà vận chuyển' },
  { resource: 'carriers', action: 'create', label: 'Tạo nhà vận chuyển' },
  { resource: 'carriers', action: 'update', label: 'Sửa nhà vận chuyển' },
  { resource: 'carriers', action: 'delete', label: 'Xóa nhà vận chuyển' },

  // Locations
  { resource: 'locations', action: 'view', label: 'Xem địa điểm' },
  { resource: 'locations', action: 'create', label: 'Tạo địa điểm' },
  { resource: 'locations', action: 'update', label: 'Sửa địa điểm' },
  { resource: 'locations', action: 'delete', label: 'Xóa địa điểm' },

  // Transport Requests
  {
    resource: 'transport-requests',
    action: 'view',
    label: 'Xem yêu cầu vận chuyển',
  },
  {
    resource: 'transport-requests',
    action: 'create',
    label: 'Tạo yêu cầu vận chuyển',
  },
  {
    resource: 'transport-requests',
    action: 'update',
    label: 'Sửa yêu cầu vận chuyển',
  },
  {
    resource: 'transport-requests',
    action: 'delete',
    label: 'Xóa yêu cầu vận chuyển',
  },

  // Settings
  { resource: 'settings', action: 'view', label: 'Xem cài đặt' },
  { resource: 'settings', action: 'update', label: 'Sửa cài đặt' },

  // Inbound International
  {
    resource: 'inbound-international',
    action: 'view',
    label: 'Xem nhập hàng quốc tế',
  },
  {
    resource: 'inbound-international',
    action: 'create',
    label: 'Tạo nhập hàng quốc tế',
  },
  {
    resource: 'inbound-international',
    action: 'update',
    label: 'Sửa nhập hàng quốc tế',
  },
  {
    resource: 'inbound-international',
    action: 'delete',
    label: 'Xóa nhập hàng quốc tế',
  },

  // Inbound Domestic
  {
    resource: 'inbound-domestic',
    action: 'view',
    label: 'Xem nhập hàng quốc nội',
  },
  {
    resource: 'inbound-domestic',
    action: 'create',
    label: 'Tạo nhập hàng quốc nội',
  },
  {
    resource: 'inbound-domestic',
    action: 'update',
    label: 'Sửa nhập hàng quốc nội',
  },
  {
    resource: 'inbound-domestic',
    action: 'delete',
    label: 'Xóa nhập hàng quốc nội',
  },

  // Inbound Schedule
  { resource: 'inbound-schedule', action: 'view', label: 'Xem lịch nhập hàng' },
  {
    resource: 'inbound-schedule',
    action: 'create',
    label: 'Tạo lịch nhập hàng',
  },
  {
    resource: 'inbound-schedule',
    action: 'update',
    label: 'Sửa lịch nhập hàng',
  },
  {
    resource: 'inbound-schedule',
    action: 'delete',
    label: 'Xóa lịch nhập hàng',
  },
];

export const PermissionsManagement: React.FC<PermissionsManagementProps> = ({
  roles,
  loading,
  onRefresh,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Group permissions by resource
  const permissionsByResource = AVAILABLE_PERMISSIONS.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  const resourceLabels: Record<string, string> = {
    employees: 'Nhân viên',
    transfers: 'Phiếu chuyển kho',
    carriers: 'Nhà vận chuyển',
    locations: 'Địa điểm',
    'transport-requests': 'Yêu cầu vận chuyển',
    settings: 'Cài đặt',
    'inbound-international': 'Nhập hàng - Quốc tế',
    'inbound-domestic': 'Nhập hàng - Quốc nội',
    'inbound-schedule': 'Nhập hàng - Lịch nhập',
  };

  useEffect(() => {
    if (selectedRoleId && roles.length > 0) {
      loadRolePermissions();
    }
  }, [selectedRoleId, roles.length]);

  const loadRolePermissions = async () => {
    if (!selectedRoleId) return;

    setPermissionsLoading(true);
    setError(null);

    try {
      const permissions = await authService.getRolePermissions(selectedRoleId);
      setRolePermissions(permissions);
    } catch {
      setError('Không thể tải quyền của vai trò');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handlePermissionChange = (
    resource: string,
    action: string,
    checked: boolean
  ) => {
    if (checked) {
      setRolePermissions((prev) => [
        ...prev,
        { roleId: selectedRoleId, resource, action },
      ]);
    } else {
      setRolePermissions((prev) =>
        prev.filter((p) => !(p.resource === resource && p.action === action))
      );
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.updateRolePermissions(selectedRoleId, rolePermissions);
      setSuccess('Đã lưu quyền thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Không thể lưu quyền');
    } finally {
      setSaving(false);
    }
  };

  const isPermissionGranted = (resource: string, action: string) => {
    return rolePermissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  const getResourceStats = () => {
    const totalPermissions = AVAILABLE_PERMISSIONS.length;
    const grantedPermissions = rolePermissions.length;
    const resourceCount = Object.keys(permissionsByResource).length;
    const grantedResources = new Set(rolePermissions.map((p) => p.resource))
      .size;

    return {
      totalPermissions,
      grantedPermissions,
      resourceCount,
      grantedResources,
    };
  };

  const stats = getResourceStats();

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TỔNG QUYỀN"
            value={stats.totalPermissions}
            icon={<SecurityIcon />}
            color="primary"
            change={{
              value: `${stats.totalPermissions} quyền trong hệ thống`,
              positive: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="QUYỀN ĐÃ CẤP"
            value={stats.grantedPermissions}
            icon={<CheckCircleIcon />}
            color="success"
            change={{
              value: `${((stats.grantedPermissions / stats.totalPermissions) * 100).toFixed(1)}% tổng số`,
              positive: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TỔNG TÀI NGUYÊN"
            value={stats.resourceCount}
            icon={<SecurityIcon />}
            color="info"
            change={{
              value: `${stats.resourceCount} tài nguyên trong hệ thống`,
              positive: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TÀI NGUYÊN CÓ QUYỀN"
            value={stats.grantedResources}
            icon={<WarningIcon />}
            color="warning"
            change={{
              value: `${((stats.grantedResources / stats.resourceCount) * 100).toFixed(1)}% tổng số`,
              positive: true,
            }}
          />
        </Grid>
      </Grid>

      {/* Role Selection */}
      <ModernCard sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SecurityIcon sx={{ fontSize: 24, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            QUẢN LÝ QUYỀN HẠN
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Chọn vai trò</InputLabel>
          <Select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            label="Chọn vai trò"
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={role.name} size="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {role.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedRoleId && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ActionButton
              variant="primary"
              startIcon={<SaveIcon />}
              onClick={handleSavePermissions}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu quyền'}
            </ActionButton>
            <ActionButton
              variant="secondary"
              startIcon={<RefreshIcon />}
              onClick={loadRolePermissions}
              disabled={permissionsLoading}
            >
              Làm mới
            </ActionButton>
          </Box>
        )}
      </ModernCard>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Permissions Grid */}
      {selectedRoleId && (
        <ModernCard sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            CẤU HÌNH QUYỀN CHO VAI TRÒ:{' '}
            {roles.find((r) => r.id === selectedRoleId)?.name}
          </Typography>

          {permissionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {Object.entries(permissionsByResource).map(
                ([resource, permissions]) => (
                  <Grid item xs={12} md={6} lg={4} key={resource}>
                    <ModernCard
                      sx={{
                        p: 2,
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}
                      >
                        {resourceLabels[resource] || resource}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      {permissions.map((permission) => (
                        <FormControlLabel
                          key={`${permission.resource}-${permission.action}`}
                          control={
                            <Checkbox
                              checked={isPermissionGranted(
                                permission.resource,
                                permission.action
                              )}
                              onChange={(e) =>
                                handlePermissionChange(
                                  permission.resource,
                                  permission.action,
                                  e.target.checked
                                )
                              }
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {permission.label}
                            </Typography>
                          }
                          sx={{ display: 'block', mb: 1 }}
                        />
                      ))}
                    </ModernCard>
                  </Grid>
                )
              )}
            </Grid>
          )}
        </ModernCard>
      )}

      {!selectedRoleId && (
        <ModernCard sx={{ p: 4, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Chọn vai trò để quản lý quyền hạn
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng chọn một vai trò từ danh sách ở trên để bắt đầu cấu hình
            quyền hạn
          </Typography>
        </ModernCard>
      )}
    </Box>
  );
};
