import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import {
  Role,
  Permission,
  RolePermission,
} from '../../../shared/types/commonTypes';
import {
  authService,
  AVAILABLE_PERMISSIONS,
} from '../../../services/googleSheets/authService';
import { logService } from '@/services/logService';
import { getSession } from '@/shared/utils/auth';

interface PermissionsManagerProps {
  roles: Role[];
}

export const PermissionsManager: React.FC<PermissionsManagerProps> = ({
  roles,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleId, roles.length]);

  const loadRolePermissions = async () => {
    if (!selectedRoleId) return;

    setLoading(true);
    setError(null);

    try {
      const permissions = await authService.getRolePermissions(selectedRoleId);
      setRolePermissions(permissions);
    } catch {
      setError('Không thể tải quyền của vai trò');
    } finally {
      setLoading(false);
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

  const isPermissionChecked = (resource: string, action: string) => {
    return rolePermissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const permissions = rolePermissions
        .filter((p) => p.roleId === selectedRoleId)
        .map((p) => ({ resource: p.resource, action: p.action }));

      await authService.updateRolePermissions(selectedRoleId, permissions);
      logService.write({
        action: 'ROLE_PERMISSIONS_UPDATE',
        resource: 'role-permissions',
        details: JSON.stringify({
          roleId: selectedRoleId,
          count: permissions.length,
        }),
      });
      // Refresh session permissions if current user role is affected
      const currentSession = getSession();
      if (currentSession?.user?.roleId === selectedRoleId) {
        try {
          const refreshed =
            await authService.getRolePermissions(selectedRoleId);
          const mapped = (refreshed || []).map((p: RolePermission) => ({
            resource: p.resource,
            action: p.action,
          }));
          const newSession = {
            ...currentSession,
            permissions: mapped,
            ts: Date.now(),
          };
          localStorage.setItem('mia_session', JSON.stringify(newSession));
        } catch (e) {
          console.warn('Failed to refresh session permissions', e);
        }
      }
      setSuccess('Đã cập nhật quyền thành công');
    } catch {
      setError('Không thể cập nhật quyền');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = (resource: string, checked: boolean) => {
    const resourcePermissions = permissionsByResource[resource] || [];

    if (checked) {
      const newPermissions = resourcePermissions.map((p) => ({
        roleId: selectedRoleId,
        resource: p.resource,
        action: p.action,
      }));
      setRolePermissions((prev) => [
        ...prev.filter((p) => p.resource !== resource),
        ...newPermissions,
      ]);
    } else {
      setRolePermissions((prev) => prev.filter((p) => p.resource !== resource));
    }
  };

  const isAllSelected = (resource: string) => {
    const resourcePermissions = permissionsByResource[resource] || [];
    return resourcePermissions.every((p) =>
      isPermissionChecked(resource, p.action)
    );
  };

  const isIndeterminate = (resource: string) => {
    const resourcePermissions = permissionsByResource[resource] || [];
    const checkedCount = resourcePermissions.filter((p) =>
      isPermissionChecked(resource, p.action)
    ).length;
    return checkedCount > 0 && checkedCount < resourcePermissions.length;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Quản lý quyền
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Chọn vai trò</InputLabel>
        <Select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          label="Chọn vai trò"
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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

      {selectedRoleId && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="subtitle1">
              Quyền của vai trò:{' '}
              {roles.find((r) => r.id === selectedRoleId)?.name}
            </Typography>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? 'Đang lưu...' : 'Lưu quyền'}
            </Button>
          </Box>

          {loading ? (
            <Typography>Đang tải quyền...</Typography>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {Object.entries(permissionsByResource).map(
                  ([resource, permissions]) => (
                    <Grid item xs={12} md={6} key={resource}>
                      <Box
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          p: 2,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isAllSelected(resource)}
                              indeterminate={isIndeterminate(resource)}
                              onChange={(e) =>
                                handleSelectAll(resource, e.target.checked)
                              }
                            />
                          }
                          label={
                            <Typography variant="subtitle2" fontWeight="bold">
                              {resourceLabels[resource] || resource}
                            </Typography>
                          }
                        />
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ ml: 3 }}>
                          {permissions.map((permission) => (
                            <FormControlLabel
                              key={`${permission.resource}-${permission.action}`}
                              control={
                                <Checkbox
                                  checked={isPermissionChecked(
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
                                  size="small"
                                />
                              }
                              label={permission.label}
                              sx={{ display: 'block', mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  )
                )}
              </Grid>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};
