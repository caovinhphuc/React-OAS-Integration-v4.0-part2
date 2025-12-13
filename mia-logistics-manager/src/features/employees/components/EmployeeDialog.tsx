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
  Box,
  Alert,
} from '@mui/material';
import { Employee } from '../../../shared/types/commonTypes';

interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSubmit: (
    employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<{ success: boolean; error?: string }>;
  title: string;
}

const initialFormData = {
  code: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  status: 'active' as const,
};

export const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  onClose,
  employee,
  onSubmit,
  title,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes or employee changes
  useEffect(() => {
    if (open) {
      if (employee) {
        setFormData({
          code: employee.code || '',
          fullName: employee.fullName || '',
          email: employee.email || '',
          phone: employee.phone || '',
          department: employee.department || '',
          position: employee.position || '',
          status: employee.status || 'active',
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [open, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Có lỗi xảy ra');
      }
    } catch {
      setError('Có lỗi xảy ra khi lưu nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
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
              label="Mã nhân viên *"
              value={formData.code}
              onChange={handleChange('code')}
              required
              fullWidth
              size="small"
            />

            <TextField
              label="Họ tên *"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              required
              fullWidth
              size="small"
            />

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
              label="Số điện thoại"
              value={formData.phone}
              onChange={handleChange('phone')}
              fullWidth
              size="small"
            />

            <TextField
              label="Phòng ban"
              value={formData.department}
              onChange={handleChange('department')}
              fullWidth
              size="small"
            />

            <TextField
              label="Chức vụ"
              value={formData.position}
              onChange={handleChange('position')}
              fullWidth
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
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
