import React from 'react';
import { Box, Typography } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Cài đặt hệ thống
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Cài đặt hệ thống đang được phát triển...
      </Typography>
    </Box>
  );
};

export default Settings;
