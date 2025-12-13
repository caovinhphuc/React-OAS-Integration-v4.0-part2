// src/features/orders/components/OrdersList.tsx
import { Order } from '@/services/googleSheets/ordersService';
import { Add, Delete, Edit, Refresh, Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useDeleteOrder, useOrders } from '../hooks/useOrders';
import CreateOrderDialog from './CreateOrderDialog';
import OrderDetailsDialog from './OrderDetailsDialog';

const OrdersList: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: orders, isLoading, error, refetch } = useOrders();
  const deleteOrderMutation = useDeleteOrder();

  const getStatusColor = (status: Order['status']) => {
    const statusColors = {
      // === TRẠNG THÁI VẬN CHUYỂN ===
      PENDING: 'default', // Chờ xử lý - Màu xám
      CONFIRMED: 'secondary', // Đã xác nhận - Màu tím
      PICKUP: 'info', // Đang lấy hàng - Màu xanh nhạt
      IN_TRANSIT: 'primary', // Đang vận chuyển - Màu xanh dương
      DELIVERED: 'success', // Đã giao - Màu xanh lá
      CANCELLED: 'error', // Đã hủy - Màu đỏ
    } as const;
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status: Order['status']) => {
    const statusLabels = {
      PENDING: 'Chờ xử lý',
      CONFIRMED: 'Đã xác nhận',
      PICKUP: 'Đang lấy hàng',
      IN_TRANSIT: 'Đang vận chuyển',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy',
    };
    return statusLabels[status] || status;
  };

  const handleDeleteOrder = async () => {
    if (selectedOrder) {
      try {
        await deleteOrderMutation.mutateAsync(selectedOrder.orderId);
        setDeleteConfirmOpen(false);
        setSelectedOrder(null);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Lỗi khi tải dữ liệu đơn hàng. Vui lòng thử lại.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => refetch()}
          startIcon={<Refresh />}
        >
          Tải lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">
          Quản lý đơn hàng ({orders?.length || 0})
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => refetch()}
            startIcon={<Refresh />}
            sx={{ mr: 1 }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Tạo đơn hàng
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table
            size="small"
            sx={{
              tableLayout: 'auto',
              '& th, & td': {
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              },
              '& .address-cell': {
                whiteSpace: 'normal',
                textOverflow: 'unset',
                overflow: 'visible',
                lineHeight: 1.2,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Điểm đi - Điểm đến</TableCell>
                <TableCell>Nhà vận chuyển</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Chi phí ước tính</TableCell>
                <TableCell align="right">Khoảng cách</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.orderId} hover>
                  <TableCell>
                    <Typography variant="body2">{order.orderId}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customerPhone}
                    </Typography>
                  </TableCell>
                  <TableCell className="address-cell">
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                      {order.pickupAddress}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ maxWidth: 200 }}
                    >
                      → {order.deliveryAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.carrierName || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(order.estimatedCost)}
                  </TableCell>
                  <TableCell align="right">
                    {order.distance
                      ? `${order.distance.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {(!orders || orders.length === 0) && (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">
              Chưa có đơn hàng nào. Tạo đơn hàng đầu tiên?
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Tạo đơn hàng
            </Button>
          </Box>
        )}
      </Paper>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add order"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Create Order Dialog */}
      <CreateOrderDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        order={selectedOrder}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận xóa đơn hàng</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa đơn hàng {selectedOrder?.orderId}? Hành
            động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteOrder}
            disabled={deleteOrderMutation.isPending}
          >
            {deleteOrderMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              'Xóa'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersList;
