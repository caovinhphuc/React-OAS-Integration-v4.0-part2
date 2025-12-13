import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Simple version of EmployeesMigrated for testing
 */
const EmployeesMigratedSimple: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          🧪 EmployeesMigrated - Test Version
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Đây là version đơn giản để test migration UI/UX.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">✅ Đã hoàn thành:</Typography>
          <ul>
            <li>Route được thêm vào router</li>
            <li>Component được import đúng</li>
            <li>Không có lỗi TypeScript</li>
          </ul>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">🚀 Tiếp theo:</Typography>
          <ul>
            <li>Thêm EnhancedDataTable</li>
            <li>Thêm StandardLayout</li>
            <li>Thêm MigrationWrapper</li>
          </ul>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeesMigratedSimple;
