import { Box, Paper, Typography } from '@mui/material';
import React from 'react';

const PendingTransfer: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" mb={2}>
        Chờ chuyển giao
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Trang này sẽ hiển thị các đơn/hàng đang ở trạng thái "Chờ chuyển giao".
        </Typography>
      </Paper>
    </Box>
  );
};

export default PendingTransfer;
