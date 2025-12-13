import { Box, Paper, Typography } from '@mui/material';
import React from 'react';

const InventoryManager: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý kho hàng
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Module kho hàng sẽ được phát triển ở Phase 2
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Tính năng bao gồm: Quản lý SKU, theo dõi tồn kho, báo cáo xuất nhập
        </Typography>
      </Paper>
    </Box>
  );
};

export default InventoryManager;
