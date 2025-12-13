import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  ModernTable,
  ModernTableColumn,
} from '../../../shared/components/ui/ModernTable';
import { Role, User } from '../../../shared/types/commonTypes';

interface UsersTableProps {
  users: User[];
  roles: Role[];
  loading?: boolean;
  error?: string;
  onEdit?: (user: User) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  roles,
  loading = false,
  error,
  onEdit,
  onAdd,
  onRefresh,
}) => {
  const columns: ModernTableColumn<User>[] = [
    {
      id: 'user',
      label: 'NGƯỜI DÙNG',
      minWidth: 300,
      sortable: true,
      searchable: true,
      render: (_, user) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: user.status === 'active' ? 'success.main' : 'grey.400',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {user.fullName || 'Chưa có tên'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'roleId',
      label: 'VAI TRÒ',
      minWidth: 200,
      sortable: true,
      searchable: true,
      render: (_, user) => {
        const role = roles.find((r) => r.id === user.roleId);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {role?.name || user.roleId}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'TRẠNG THÁI',
      minWidth: 140,
      align: 'center',
      sortable: true,
      render: (_, user) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {user.status === 'active' ? (
            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
          ) : (
            <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
          )}
          <Chip
            label={user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
            color={user.status === 'active' ? 'success' : 'default'}
            size="small"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
            }}
          />
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'THAO TÁC',
      minWidth: 100,
      align: 'center',
      render: (_, user) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Chỉnh sửa người dùng">
            <IconButton
              size="small"
              onClick={() => onEdit?.(user)}
              color="primary"
              sx={{
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <ModernTable
      columns={columns}
      data={users}
      loading={loading}
      error={error}
      searchable
      onRefresh={onRefresh}
      title="Danh sách người dùng"
      subtitle="Quản lý và theo dõi người dùng trong hệ thống"
      emptyMessage="Không có người dùng nào"
      rowsPerPageOptions={[5, 10, 25]}
      initialRowsPerPage={10}
      headerActions={
        onAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Thêm người dùng
          </Button>
        )
      }
    />
  );
};

export default UsersTable;
