import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { io } from 'socket.io-client';

const NotificationBadge = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5050', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      setUnreadCount(prev => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setUnreadCount(prev => Math.max(0, prev - 1));
    handleClose();
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'carrier-update':
        return <InfoIcon color="primary" />;
      case 'order-status':
        return <CheckCircleIcon color="success" />;
      case 'system-alert':
        return <WarningIcon color="warning" />;
      case 'daily-report':
      case 'weekly-report':
      case 'monthly-report':
        return <ScheduleIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return notificationTime.toLocaleDateString('vi-VN');
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Thông báo</Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                startIcon={<ClearAllIcon />}
                onClick={handleClearAll}
              >
                Xóa tất cả
              </Button>
            )}
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Box textAlign="center" py={2} width="100%">
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Không có thông báo mới
              </Typography>
            </Box>
          </MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <MenuItem
                onClick={() => handleNotificationClick(notification)}
                sx={{ py: 1.5 }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" noWrap>
                      {notification.type.replace('-', ' ').toUpperCase()}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {JSON.stringify(notification.data).substring(0, 50)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBadge;
