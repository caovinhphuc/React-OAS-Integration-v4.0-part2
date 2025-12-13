import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Security, Timer, DeviceHub, LocationOn } from '@mui/icons-material';
import { useSecurityContext } from '@/contexts/SecurityContext';

export const SecurityStatus: React.FC = () => {
  const { sessionInfo, isSessionValid } = useSecurityContext();

  if (!sessionInfo) {
    return null;
  }

  const formatLastActivity = (timestamp: number | null) => {
    if (!timestamp) return 'Không xác định';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const getSessionStatusColor = () => {
    if (!isSessionValid) return 'error';

    const now = Date.now();
    const lastActivity = sessionInfo.lastActivity || 0;
    const timeSinceLastActivity = now - lastActivity;
    const warningThreshold = 25 * 60 * 1000; // 25 phút

    if (timeSinceLastActivity > warningThreshold) return 'warning';
    return 'success';
  };

  const getSessionStatusText = () => {
    if (!isSessionValid) return 'Phiên hết hạn';

    const now = Date.now();
    const lastActivity = sessionInfo.lastActivity || 0;
    const timeSinceLastActivity = now - lastActivity;
    const remainingTime = 30 * 60 * 1000 - timeSinceLastActivity; // 30 phút total

    if (remainingTime <= 0) return 'Phiên hết hạn';

    const remainingMinutes = Math.ceil(remainingTime / (1000 * 60));
    return `Còn ${remainingMinutes} phút`;
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 2,
        bgcolor: 'background.paper',
        mb: 2,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <Security color="primary" />
          Trạng thái bảo mật
        </Typography>

        <Chip
          label={getSessionStatusText()}
          color={getSessionStatusColor()}
          size="small"
          variant="outlined"
        />
      </Box>

      <Box display="flex" flexDirection="column" gap={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <Timer fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Hoạt động cuối: {formatLastActivity(sessionInfo.lastActivity)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <DeviceHub fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Thiết bị: {sessionInfo.deviceId?.slice(0, 8)}...
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            IP: {sessionInfo.ipAddress || 'Không xác định'}
          </Typography>
        </Box>
      </Box>

      {/* Nút logout đã bị xóa để tránh duplicate logging */}
      {/* Chỉ sử dụng logout từ Header.tsx */}
    </Box>
  );
};
