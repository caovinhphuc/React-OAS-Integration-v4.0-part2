import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  GridView as GridViewIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  AdvancedDataTable,
  EnhancedGridView,
  ActionButton,
  ActionIcons,
} from '../../shared/components/ui';
import type { AdvancedTableColumn } from '../../shared/components/ui/AdvancedDataTable';
import type { EnhancedGridViewItem } from '../../shared/components/ui/EnhancedGridView';
import { useEmployees } from './hooks/useEmployees';
import { EmployeeDialog } from './components/EmployeeDialog';
import { Employee } from '../../shared/types/commonTypes';
import { hasPermission } from '../../shared/utils/auth';

const EmployeesComponent: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [selectedEmployeeForAction, setSelectedEmployeeForAction] =
    useState<Employee | null>(null);

  const {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  // Toggle employee status (active/inactive)
  const toggleEmployeeStatus = useCallback(
    async (employee: Employee) => {
      const newStatus = employee.status === 'active' ? 'inactive' : 'active';
      const result = await updateEmployee(employee.id, { status: newStatus });
      if (result.success) {
        // Status will be updated automatically through the hook
      }
    },
    [updateEmployee]
  );

  // Action menu handlers
  const handleActionMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
      setActionMenuAnchor(event.currentTarget);
      setSelectedEmployeeForAction(employee);
    },
    []
  );

  const handleActionMenuClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedEmployeeForAction(null);
  }, []);

  // Table columns
  const columns: AdvancedTableColumn<Employee>[] = useMemo(
    () => [
      {
        id: 'code',
        label: 'MÃ NV',
        minWidth: 120,
        render: (_, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: row.status === 'active' ? 'primary.main' : 'grey.400',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: '2px solid',
                borderColor:
                  row.status === 'active' ? 'primary.light' : 'grey.300',
              }}
            >
              {row.fullName ? row.fullName.charAt(0).toUpperCase() : 'N'}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {row.code}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                ID
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'fullName',
        label: 'HỌ TÊN',
        minWidth: 180,
        sortable: true,
        searchable: true,
        render: (_, row) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'text.primary',
                lineHeight: 1.3,
              }}
            >
              {row.fullName || 'Chưa có tên'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor:
                    row.status === 'active' ? 'success.main' : 'grey.400',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  fontStyle: 'italic',
                }}
              >
                {row.department || 'Chưa có phòng ban'}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'email',
        label: 'EMAIL',
        minWidth: 160,
        sortable: true,
        searchable: true,
        render: (_, row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.85rem',
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            {row.email || 'Chưa có email'}
          </Typography>
        ),
      },
      {
        id: 'phone',
        label: 'SỐ ĐIỆN THOẠI',
        minWidth: 120,
        sortable: true,
        render: (_, row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.85rem',
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            {row.phone || '-'}
          </Typography>
        ),
      },
      {
        id: 'department',
        label: 'PHÒNG BAN',
        minWidth: 120,
        sortable: true,
        render: (_, row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.85rem',
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            {row.department || '-'}
          </Typography>
        ),
      },
      {
        id: 'position',
        label: 'CHỨC VỤ',
        minWidth: 120,
        sortable: true,
        render: (_, row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.85rem',
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            {row.position || '-'}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'TRẠNG THÁI',
        minWidth: 100,
        align: 'center',
        sortable: true,
        render: (_, row) => (
          <Box
            sx={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: row.status === 'active' ? 'success.light' : 'grey.100',
              color:
                row.status === 'active' ? 'success.dark' : 'text.secondary',
              border: '1px solid',
              borderColor:
                row.status === 'active' ? 'success.main' : 'grey.300',
              fontSize: '0.75rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: row.status === 'active' ? 'success.main' : 'grey.200',
                color: row.status === 'active' ? 'white' : 'text.primary',
                transform: 'scale(1.05)',
              },
            }}
            onClick={() => toggleEmployeeStatus(row)}
          >
            {row.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
          </Box>
        ),
      },
      {
        id: 'actions',
        label: 'THAO TÁC',
        minWidth: 80,
        align: 'center',
        format: 'actions',
        render: (_, row) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Thao tác">
              <span>
                <IconButton
                  size="small"
                  onClick={(event) => handleActionMenuOpen(event, row)}
                  color="default"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [toggleEmployeeStatus, handleActionMenuOpen]
  );

  const handleEdit = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
        const result = await deleteEmployee(id);
        if (!result.success) {
          alert(result.error || 'Không thể xóa nhân viên');
        }
      }
    },
    [deleteEmployee]
  );

  const handleActionClick = useCallback(
    (action: string) => {
      if (!selectedEmployeeForAction) return;

      switch (action) {
        case 'edit':
          handleEdit(selectedEmployeeForAction);
          break;
        case 'delete':
          handleDelete(selectedEmployeeForAction.id);
          break;
      }

      handleActionMenuClose();
    },
    [selectedEmployeeForAction, handleEdit, handleDelete, handleActionMenuClose]
  );

  // Table rows - Fix data mapping issue
  const rows: Employee[] = useMemo(
    () =>
      employees.map((employee) => ({
        ...employee,
        phone: employee.phone || '-',
        department: employee.department || '-',
        position: employee.position || '-',
      })),
    [employees]
  );

  // Grid items with expandable details
  const gridItems: EnhancedGridViewItem[] = useMemo(
    () =>
      employees.map((employee) => ({
        id: employee.id,
        title: employee.fullName || 'Chưa có tên',
        subtitle: employee.code,
        description: `${employee.department || 'Chưa có phòng ban'} - ${employee.position || 'Chưa có chức vụ'}`,
        avatar: employee.fullName
          ? employee.fullName.charAt(0).toUpperCase()
          : 'N',
        status: {
          label: employee.status === 'active' ? 'Hoạt động' : 'Tạm dừng',
          color: employee.status === 'active' ? 'success' : 'default',
        },
        priority: employee.status === 'active' ? 'high' : 'low',
        tags: [
          employee.department || 'Chưa có phòng ban',
          employee.position || 'Chưa có chức vụ',
        ],
        info: [
          {
            icon: <EditIcon />,
            label: 'Email',
            value: employee.email || 'Chưa có email',
          },
          {
            icon: <EditIcon />,
            label: 'Số điện thoại',
            value: employee.phone || 'Chưa có',
          },
          {
            icon: <EditIcon />,
            label: 'Phòng ban',
            value: employee.department || 'Chưa có',
          },
          {
            icon: <EditIcon />,
            label: 'Chức vụ',
            value: employee.position || 'Chưa có',
          },
        ],
        stats: [
          {
            label: 'Trạng thái',
            value: employee.status === 'active' ? 'Hoạt động' : 'Tạm dừng',
            color: employee.status === 'active' ? '#4caf50' : '#9e9e9e',
          },
          {
            label: 'Ngày tạo',
            value: employee.createdAt
              ? new Date(employee.createdAt).toLocaleDateString('vi-VN')
              : 'Chưa có',
            color: '#2196f3',
          },
        ],
        onEdit: () => handleEdit(employee),
        onDelete: () => handleDelete(employee.id),
        onToggleFavorite: () => toggleEmployeeStatus(employee),
        isFavorite: employee.status === 'active',
      })),
    [employees, handleEdit, handleDelete, toggleEmployeeStatus]
  );

  const handleAdd = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (
    employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (selectedEmployee) {
      return await updateEmployee(selectedEmployee.id, employeeData);
    } else {
      return await createEmployee(employeeData);
    }
  };

  const handleRefresh = () => {
    fetchEmployees();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Quản lý Nhân viên
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Làm mới">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {hasPermission('employees', 'create') && (
            <ActionButton
              variant="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Thêm nhân viên
            </ActionButton>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* View Mode Toggle */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          p: 1.5,
          bgcolor: 'background.paper',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Xem dạng bảng">
            <IconButton
              onClick={() => setViewMode('table')}
              color={viewMode === 'table' ? 'primary' : 'default'}
              sx={{
                bgcolor: viewMode === 'table' ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor:
                    viewMode === 'table' ? 'primary.light' : 'action.hover',
                },
              }}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xem dạng thẻ">
            <IconButton
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
              sx={{
                bgcolor: viewMode === 'grid' ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor:
                    viewMode === 'grid' ? 'primary.light' : 'action.hover',
                },
              }}
            >
              <GridViewIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Counter */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            bgcolor: 'success.light',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'success.main',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'success.main',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Tổng cộng: <strong>{employees?.length || 0}</strong> nhân viên
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      {employees && employees.length > 0 ? (
        viewMode === 'table' ? (
          <AdvancedDataTable
            columns={columns}
            data={rows}
            title="DANH SÁCH NHÂN VIÊN"
            subtitle={`Tổng cộng ${rows.length} nhân viên`}
            loading={loading}
            selectable
            selectedRows={rows.filter((row) => selectedIds.includes(row.id))}
            onSelectionChange={(selected) =>
              setSelectedIds(selected.map((row) => row.id))
            }
            onEdit={handleEdit}
            onDelete={(row) => handleDelete(row.id)}
            searchable
            pagination
            showRowNumbers
            alternateRowColors
            hoverEffects
            emptyMessage="Không có nhân viên nào"
            actions={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ActionButton
                  variant="primary"
                  startIcon={<ActionIcons.add />}
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
              </Box>
            }
          />
        ) : (
          <Box
            sx={{
              height: 'calc(100vh - 280px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: '#a8a8a8',
                },
              },
            }}
          >
            <EnhancedGridView
              items={gridItems}
              title="DANH SÁCH NHÂN VIÊN"
              subtitle={`Tổng cộng ${gridItems.length} nhân viên`}
              selectable
              selectedItems={gridItems.filter((item) =>
                selectedIds.includes(item.id)
              )}
              onSelectionChange={(selected) =>
                setSelectedIds(selected.map((item) => item.id))
              }
              onItemClick={(item: EnhancedGridViewItem) =>
                handleEdit(employees.find((emp) => emp.id === item.id)!)
              }
              showStats
              showActions
              showFavorites
              columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              actions={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ActionButton
                    variant="primary"
                    startIcon={<ActionIcons.add />}
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
                </Box>
              }
            />
          </Box>
        )
      ) : (
        <Paper
          sx={{
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">
              Chưa có nhân viên nào. Thêm nhân viên đầu tiên?
            </Typography>
            <ActionButton
              variant="primary"
              startIcon={<ActionIcons.add />}
              onClick={handleAdd}
              sx={{ mt: 2 }}
            >
              Thêm nhân viên
            </ActionButton>
          </Box>
        </Paper>
      )}

      {/* Action Menu Popup */}
      <Popover
        open={Boolean(actionMenuAnchor)}
        anchorEl={actionMenuAnchor}
        onClose={handleActionMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 180,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 2,
          },
        }}
      >
        <List sx={{ py: 0 }}>
          {hasPermission('employees', 'update') && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleActionClick('edit')}>
                <EditIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="Sửa"
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}
          {hasPermission('employees', 'delete') && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleActionClick('delete')}>
                <DeleteIcon sx={{ mr: 2, color: 'error.main' }} />
                <ListItemText
                  primary="Xóa"
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Popover>

      <EmployeeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        employee={selectedEmployee}
        onSubmit={handleSubmit}
        title={selectedEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
      />
    </Box>
  );
};

// Export the component directly
export const Employees = EmployeesComponent;
