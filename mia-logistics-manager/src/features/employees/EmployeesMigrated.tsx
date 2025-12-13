import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';

// Import standardized components
import { StandardLayout } from '@/shared/components/ui/StandardLayout';
import ActionButton from '@/shared/components/ui/ActionButton';
import StatusChip from '@/shared/components/ui/StatusChip';
import EnhancedDataTable from '@/shared/components/ui/EnhancedDataTable';
import MigrationWrapper from '@/shared/components/ui/MigrationWrapper';

// Import existing components for comparison
// import { Employees } from './Employees';

// Types
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface DataTableColumn<T> {
  id: keyof T | string;
  label: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  getValue?: (row: T) => unknown;
}

/**
 * Migrated Employees component using standardized UI components
 * This is an example of how to migrate from old to new UI standards
 */
const EmployeesMigrated: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Define table columns using standardized approach
  const columns: DataTableColumn<Employee>[] = [
    {
      id: 'name',
      label: 'Họ tên',
      width: '200px',
      sortable: true,
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {String(value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'phone',
      label: 'Số điện thoại',
      width: '150px',
      sortable: true,
      render: (value) => String(value),
    },
    {
      id: 'position',
      label: 'Chức vụ',
      width: '150px',
      sortable: true,
    },
    {
      id: 'department',
      label: 'Phòng ban',
      width: '150px',
      sortable: true,
    },
    {
      id: 'status',
      label: 'Trạng thái',
      width: '120px',
      align: 'center',
      render: (value) => (
        <StatusChip
          status={String(value) as 'active' | 'inactive'}
          label={String(value) === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      width: '120px',
      sortable: true,
      render: (value) => new Date(String(value)).toLocaleDateString('vi-VN'),
    },
  ];

  // Load employees data
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockEmployees: Employee[] = [
        {
          id: '1',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@mia.vn',
          phone: '0123456789',
          position: 'Nhân viên',
          department: 'Kế toán',
          status: 'active',
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Trần Thị B',
          email: 'tranthib@mia.vn',
          phone: '0987654321',
          position: 'Trưởng phòng',
          department: 'Nhân sự',
          status: 'active',
          createdAt: '2024-01-10',
        },
        {
          id: '3',
          name: 'Lê Văn C',
          email: 'levanc@mia.vn',
          phone: '0369852147',
          position: 'Nhân viên',
          department: 'Kỹ thuật',
          status: 'inactive',
          createdAt: '2024-01-05',
        },
      ];

      setEmployees(mockEmployees);
    } catch {
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải dữ liệu nhân viên',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle employee selection
  const handleSelectionChange = (selected: Employee[]) => {
    setSelectedEmployees(selected);
  };

  // Handle row click
  const handleRowClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      status: employee.status,
    });
    setOpenDialog(true);
  };

  // Handle add new employee
  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      status: 'active',
    });
    setOpenDialog(true);
  };

  // Handle save employee
  const handleSave = async () => {
    try {
      if (editingEmployee) {
        // Update existing employee
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingEmployee.id ? { ...emp, ...formData } : emp
          )
        );
        setSnackbar({
          open: true,
          message: 'Cập nhật nhân viên thành công',
          severity: 'success',
        });
      } else {
        // Add new employee
        const newEmployee: Employee = {
          id: String(employees.length + 1),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setEmployees((prev) => [...prev, newEmployee]);
        setSnackbar({
          open: true,
          message: 'Thêm nhân viên thành công',
          severity: 'success',
        });
      }
      setOpenDialog(false);
    } catch {
      setSnackbar({
        open: true,
        message: 'Lỗi khi lưu nhân viên',
        severity: 'error',
      });
    }
  };

  // Handle delete selected employees
  const handleDeleteSelected = () => {
    setEmployees((prev) =>
      prev.filter(
        (emp) => !selectedEmployees.some((selected) => selected.id === emp.id)
      )
    );
    setSelectedEmployees([]);
    setSnackbar({
      open: true,
      message: `Đã xóa ${selectedEmployees.length} nhân viên`,
      severity: 'success',
    });
  };

  return (
    <MigrationWrapper
      componentName="Employees"
      migrationStatus="in-progress"
      newComponent={EmployeesMigrated}
      migrationNotes="Đang migration sang EnhancedDataTable và StandardLayout"
    >
      <StandardLayout variant="page">
        {/* Action Bar */}
        <StandardLayout variant="actionBar">
          <Typography variant="h4">Quản lý nhân viên</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ActionButton
              variant="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Thêm nhân viên
            </ActionButton>
            <ActionButton
              variant="secondary"
              startIcon={<RefreshIcon />}
              onClick={fetchEmployees}
              disabled={loading}
            >
              Làm mới
            </ActionButton>
            {selectedEmployees.length > 0 && (
              <ActionButton variant="error" onClick={handleDeleteSelected}>
                Xóa đã chọn ({selectedEmployees.length})
              </ActionButton>
            )}
          </Box>
        </StandardLayout>

        {/* Data Table */}
        <StandardLayout variant="section">
          <EnhancedDataTable
            columns={columns}
            data={employees}
            title="Danh sách nhân viên"
            loading={loading}
            selectable={true}
            onRowClick={handleRowClick}
            onSelectionChange={handleSelectionChange}
            searchable={true}
            filterable={true}
            showStats={true}
            getRowId={(row: Employee) => row.id}
            actions={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined">
                  Xuất Excel
                </Button>
                <Button size="small" variant="outlined">
                  Import
                </Button>
              </Box>
            }
          />
        </StandardLayout>
      </StandardLayout>

      {/* Employee Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Họ tên"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Chức vụ"
              value={formData.position}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, position: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Phòng ban"
              value={formData.department}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as 'active' | 'inactive',
                  }))
                }
                label="Trạng thái"
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            {editingEmployee ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MigrationWrapper>
  );
};

export default EmployeesMigrated;
