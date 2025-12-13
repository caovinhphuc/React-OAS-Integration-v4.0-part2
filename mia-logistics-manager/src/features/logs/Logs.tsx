import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import { DataTable, ActionButton } from '@/shared/components/ui';
import type { DataTableColumn } from '@/shared/components/ui';

type LogRow = {
  id: string;
  timestamp: string;
  userId?: string;
  email?: string;
  action?: string;
  resource?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
};

const API = 'http://localhost:5050/api';

const Logs: React.FC = () => {
  console.log('Logs component rendering...');

  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    email: '',
    from: '',
    to: '',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && q.append(k, v));
      q.append('limit', '500');
      const res = await fetch(`${API}/logs?${q.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setRows(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const columns: DataTableColumn<LogRow>[] = [
    {
      id: 'timestamp',
      label: 'Thời gian',
      width: 140,
      render: (row: LogRow) => {
        const v = row.timestamp;
        if (!v) return '';
        try {
          const date = new Date(v);
          return date.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        } catch {
          return v;
        }
      },
    },
    { id: 'email', label: 'Người dùng', width: 150 },
    { id: 'action', label: 'Hành động', width: 120 },
    { id: 'resource', label: 'Tài nguyên', width: 100 },
    {
      id: 'details',
      label: 'Chi tiết',
      width: 200,
      render: (row: LogRow) => {
        const v = row.details;
        if (!v) return '';
        return v.length > 80 ? v.slice(0, 80) + '…' : v;
      },
    },
    { id: 'ip', label: 'Địa chỉ IP', width: 100 },
    { id: 'userAgent', label: 'Trình duyệt', width: 180 },
  ];

  const handleExport = () => {
    const q = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && q.append(k, v));
    q.append('limit', '1000');
    window.location.href = `${API}/logs/export?${q.toString()}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Nhật ký hoạt động
      </Typography>

      {error && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: 'error.light',
            borderRadius: 1,
            color: 'error.contrastText',
          }}
        >
          <strong>Lỗi:</strong> {error}
        </Box>
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          label="Hành động"
          size="small"
          select
          value={filters.action}
          onChange={(e) =>
            setFilters((f) => ({ ...f, action: e.target.value }))
          }
          sx={{
            minWidth: 140,
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem',
            },
            '& .MuiSelect-select': {
              fontSize: '0.8rem',
            },
          }}
        >
          <MenuItem value="" sx={{ fontSize: '0.8rem' }}>
            Tất cả
          </MenuItem>
          <MenuItem value="LOGIN" sx={{ fontSize: '0.8rem' }}>
            Đăng nhập
          </MenuItem>
          <MenuItem value="LOGOUT" sx={{ fontSize: '0.8rem' }}>
            Đăng xuất
          </MenuItem>
          <MenuItem value="LOGIN_UI" sx={{ fontSize: '0.8rem' }}>
            Đăng nhập UI
          </MenuItem>
          <MenuItem value="LOGOUT_UI" sx={{ fontSize: '0.8rem' }}>
            Đăng xuất UI
          </MenuItem>
          <MenuItem value="EMPLOYEE_CREATE" sx={{ fontSize: '0.8rem' }}>
            Tạo nhân viên
          </MenuItem>
          <MenuItem value="EMPLOYEE_UPDATE" sx={{ fontSize: '0.8rem' }}>
            Cập nhật nhân viên
          </MenuItem>
          <MenuItem value="EMPLOYEE_DELETE" sx={{ fontSize: '0.8rem' }}>
            Xóa nhân viên
          </MenuItem>
          <MenuItem value="ROLE_CREATE" sx={{ fontSize: '0.8rem' }}>
            Tạo vai trò
          </MenuItem>
          <MenuItem value="ROLE_UPDATE" sx={{ fontSize: '0.8rem' }}>
            Cập nhật vai trò
          </MenuItem>
          <MenuItem value="USER_CREATE" sx={{ fontSize: '0.8rem' }}>
            Tạo người dùng
          </MenuItem>
          <MenuItem value="USER_UPDATE" sx={{ fontSize: '0.8rem' }}>
            Cập nhật người dùng
          </MenuItem>
          <MenuItem value="ROLE_PERMISSIONS_UPDATE" sx={{ fontSize: '0.8rem' }}>
            Cập nhật quyền vai trò
          </MenuItem>
        </TextField>
        <TextField
          label="Tài nguyên"
          size="small"
          select
          value={filters.resource}
          onChange={(e) =>
            setFilters((f) => ({ ...f, resource: e.target.value }))
          }
          sx={{
            minWidth: 120,
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem',
            },
            '& .MuiSelect-select': {
              fontSize: '0.8rem',
            },
          }}
        >
          <MenuItem value="" sx={{ fontSize: '0.8rem' }}>
            Tất cả
          </MenuItem>
          <MenuItem value="auth" sx={{ fontSize: '0.8rem' }}>
            Xác thực
          </MenuItem>
          <MenuItem value="employees" sx={{ fontSize: '0.8rem' }}>
            Nhân viên
          </MenuItem>
          <MenuItem value="users" sx={{ fontSize: '0.8rem' }}>
            Người dùng
          </MenuItem>
          <MenuItem value="roles" sx={{ fontSize: '0.8rem' }}>
            Vai trò
          </MenuItem>
          <MenuItem value="role-permissions" sx={{ fontSize: '0.8rem' }}>
            Quyền vai trò
          </MenuItem>
        </TextField>
        <TextField
          label="Email"
          size="small"
          value={filters.email}
          onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
          sx={{
            minWidth: 120,
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem',
            },
            '& .MuiInputBase-input': {
              fontSize: '0.8rem',
            },
          }}
        />
        <TextField
          label="Từ ngày"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          sx={{
            minWidth: 120,
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem',
            },
            '& .MuiInputBase-input': {
              fontSize: '0.8rem',
            },
          }}
        />
        <TextField
          label="Đến ngày"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          sx={{
            minWidth: 120,
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem',
            },
            '& .MuiInputBase-input': {
              fontSize: '0.8rem',
            },
          }}
        />
        <Button
          variant="outlined"
          onClick={fetchLogs}
          sx={{
            fontSize: '0.8rem',
            px: 1.5,
            py: 0.75,
          }}
        >
          Làm mới
        </Button>
        <ActionButton
          variant="primary"
          onClick={handleExport}
          sx={{
            fontSize: '0.8rem',
            px: 1.5,
            py: 0.75,
          }}
        >
          Xuất CSV
        </ActionButton>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Hiển thị {rows.length} / {rows.length} nhật ký
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: 'transparent',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
          overflow: 'visible',
          '& .MuiTableContainer-root': {
            bgcolor: 'transparent',
          },
          '& .MuiTable-root': {
            bgcolor: 'transparent',
          },
          '& .MuiTableBody-root': {
            bgcolor: 'transparent',
          },
        }}
      >
        <DataTable<LogRow>
          columns={columns}
          data={rows}
          loading={loading}
          emptyMessage="Không có log"
        />
      </Box>
    </Box>
  );
};

export default Logs;
