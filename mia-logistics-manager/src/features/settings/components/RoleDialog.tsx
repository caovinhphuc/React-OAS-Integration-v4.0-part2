import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { Role } from '../../../shared/types/commonTypes';

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
  onSubmit: (role: Omit<Role, 'id'> | Role) => Promise<{ success: boolean; error?: string }>;
  title: string;
}

const initialFormData = {
  name: '',
  description: '',
};

export const RoleDialog: React.FC<RoleDialogProps> = ({
  open,
  onClose,
  role,
  onSubmit,
  title,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (role) {
        setFormData({
          name: role.name,
          description: role.description,
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [open, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await onSubmit(role ? { ...role, ...formData } : formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu vai trò');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Tên vai trò *"
            value={formData.name}
            onChange={handleChange('name')}
            required
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={handleChange('description')}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
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
