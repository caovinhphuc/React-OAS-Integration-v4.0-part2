import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
} from '@mui/material';
import { User, Role } from '../../../shared/types/commonTypes';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  roles: Role[];
  onSubmit: (user: any) => Promise<{ success: boolean; error?: string }>;
  title: string;
}

const initialFormData = {
  email: '',
  password: '',
  fullName: '',
  roleId: 'admin',
  status: 'active' as const,
};

export const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  user,
  roles,
  onSubmit,
  title,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          email: user.email,
          password: '',
          fullName: user.fullName,
          roleId: user.roleId,
          status: user.status,
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = user ? { ...formData, id: user.id } : formData;

      const result = await onSubmit(submitData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Email *"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              fullWidth
              size="small"
            />
            <TextField
              label={
                user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'
              }
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required={!user}
              fullWidth
              size="small"
            />
            <TextField
              label="Họ tên"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={formData.roleId}
                onChange={handleChange('roleId')}
                label="Vai trò"
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                onChange={handleChange('status')}
                label="Trạng thái"
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
