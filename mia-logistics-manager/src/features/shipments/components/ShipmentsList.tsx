import { Add } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';

const ShipmentsList: React.FC = () => {
  const mockShipments = [
    {
      id: 'SH001',
      customer: 'Nguyễn Văn A',
      status: 'Đang giao',
      destination: 'Hà Nội',
      cost: '250,000 VNĐ',
    },
    {
      id: 'SH002',
      customer: 'Trần Thị B',
      status: 'Hoàn thành',
      destination: 'TP.HCM',
      cost: '320,000 VNĐ',
    },
    {
      id: 'SH003',
      customer: 'Lê Văn C',
      status: 'Chuẩn bị',
      destination: 'Đà Nẵng',
      cost: '180,000 VNĐ',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      // === TRẠNG THÁI PHIẾU (4 loại) ===
      case 'Đề nghị chuyển kho':
        return 'warning'; // Màu cam
      case 'Xuất chuyển kho':
        return 'secondary'; // Màu tím
      case 'Nhập chuyển kho':
        return 'info'; // Màu xanh nhạt
      case 'Đã hủy':
        return 'error'; // Màu đỏ

      // === TRẠNG THÁI VẬN CHUYỂN (9 loại) ===
      case 'Chờ báo kiện':
        return 'default'; // Màu xám
      case 'Chờ chuyển giao':
        return 'warning'; // Màu cam
      case 'Đang chuyển giao':
      case 'Đang giao':
        return 'primary'; // Màu xanh dương
      case 'Đã chuyển giao':
      case 'Đã giao hàng':
      case 'Hoàn thành':
        return 'success'; // Màu xanh lá
      case 'Chờ xác nhận':
        return 'info'; // Màu xanh nhạt
      case 'Đã xác nhận':
        return 'secondary'; // Màu tím
      case 'Đang vận chuyển':
        return 'primary'; // Màu xanh dương
      case 'Chuẩn bị':
        return 'default'; // Màu xám

      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Quản lý vận chuyển</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Tạo đơn vận chuyển
        </Button>
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
                <TableCell>Điểm đến</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Chi phí</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell>{shipment.id}</TableCell>
                  <TableCell>{shipment.customer}</TableCell>
                  <TableCell className="address-cell">
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: '0.65rem', fontWeight: 500 }}
                      >
                        {shipment.destination?.split(' - ')[0] ||
                          shipment.destination}
                      </Typography>
                      {shipment.destination?.includes(' - ') && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.55rem' }}
                        >
                          {shipment.destination
                            .split(' - ')
                            .slice(1)
                            .join(' - ')}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={shipment.status}
                      color={getStatusColor(shipment.status) as any}
                      variant="outlined"
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        minWidth: '80px',
                        bgcolor: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{shipment.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ShipmentsList;
