import { Box, Paper, Typography } from '@mui/material';
import React from 'react';

const TrackingDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Theo dõi vận chuyển
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Module theo dõi sẽ được phát triển ở Phase 2
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Tính năng bao gồm: Bản đồ theo dõi real-time, timeline trạng thái, thông báo
        </Typography>
      </Paper>
    </Box>
  );
};

export default TrackingDashboard;
