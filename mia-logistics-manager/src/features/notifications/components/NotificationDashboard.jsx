import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Wifi as WifiIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const NotificationDashboard = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [testNotificationOpen, setTestNotificationOpen] = useState(false);
  const [testNotificationData, setTestNotificationData] = useState({
    type: '',
    priority: 'medium',
    data: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    telegram: true,
    email: true,
    realtime: true,
    dailyReport: true,
    weeklyReport: true,
    monthlyReport: true,
    systemAlerts: true,
  });

  const queryClient = useQueryClient();

  // Fetch notification status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['notificationStatus'],
    queryFn: async () => {
      const response = await fetch(
        'http://localhost:5050/api/notifications/status'
      );
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch notification history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['notificationHistory'],
    queryFn: async () => {
      const response = await fetch(
        'http://localhost:5050/api/notifications/history?limit=50'
      );
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(
        'http://localhost:5050/api/notifications/test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationHistory']);
      setTestNotificationOpen(false);
    },
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5050', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
    });

    newSocket.on('welcome', (data) => {
      console.log('Welcome message:', data);
    });

    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep last 50
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTestNotification = (data) => {
    testNotificationMutation.mutate(data);
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

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  if (statusLoading) {
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

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          🔔 Notification Dashboard
        </Typography>
        <Box>
          <Tooltip title="Test Notification">
            <IconButton
              onClick={() => setTestNotificationOpen(true)}
              color="primary"
              sx={{ mr: 1 }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => setSettingsOpen(true)} color="primary">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Service Status Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TelegramIcon
                  color={status?.telegram?.isInitialized ? 'success' : 'error'}
                  sx={{ mr: 1 }}
                />
                <Typography variant="h6">Telegram Bot</Typography>
              </Box>
              <Chip
                label={status?.telegram?.isInitialized ? 'Active' : 'Inactive'}
                color={status?.telegram?.isInitialized ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <EmailIcon
                  color={status?.email?.isInitialized ? 'success' : 'error'}
                  sx={{ mr: 1 }}
                />
                <Typography variant="h6">Email Service</Typography>
              </Box>
              <Chip
                label={status?.email?.isInitialized ? 'Active' : 'Inactive'}
                color={status?.email?.isInitialized ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <WifiIcon
                  color={status?.realtime?.isInitialized ? 'success' : 'error'}
                  sx={{ mr: 1 }}
                />
                <Typography variant="h6">Real-time</Typography>
              </Box>
              <Chip
                label={
                  status?.realtime?.isInitialized ? 'Connected' : 'Disconnected'
                }
                color={status?.realtime?.isInitialized ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <NotificationsIcon
                  color={status?.isInitialized ? 'success' : 'error'}
                  sx={{ mr: 1 }}
                />
                <Typography variant="h6">Manager</Typography>
              </Box>
              <Chip
                label={status?.isInitialized ? 'Active' : 'Inactive'}
                color={status?.isInitialized ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Badge badgeContent={notifications.length} color="primary">
                Live Notifications
              </Badge>
            }
            icon={<NotificationsActiveIcon />}
            iconPosition="start"
          />
          <Tab label="History" icon={<HistoryIcon />} iconPosition="start" />
          <Tab
            label="Scheduled Tasks"
            icon={<ScheduleIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* Live Notifications Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box textAlign="center" py={4}>
                <NotificationsOffIcon
                  sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No live notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Notifications will appear here in real-time
                </Typography>
              </Box>
            ) : (
              <List>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {notification.type
                                .replace('-', ' ')
                                .toUpperCase()}
                            </Typography>
                            <Chip
                              label={notification.priority}
                              color={getNotificationColor(
                                notification.priority
                              )}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {JSON.stringify(notification.data, null, 2)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTimestamp(notification.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* History Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            {historyLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : history?.length === 0 ? (
              <Box textAlign="center" py={4}>
                <HistoryIcon
                  sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No notification history
                </Typography>
              </Box>
            ) : (
              <List>
                {history.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getNotificationIcon(item.templateName)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {item.templateName
                                .replace('-', ' ')
                                .toUpperCase()}
                            </Typography>
                            <Chip
                              label={`${item.results.success.length} success, ${item.results.failed.length} failed`}
                              color={
                                item.results.failed.length === 0
                                  ? 'success'
                                  : 'warning'
                              }
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Channels: {item.results.success.join(', ')}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTimestamp(item.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < history.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Scheduled Tasks Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {status?.scheduledTasks &&
                Object.entries(status.scheduledTasks).map(([name, task]) => (
                  <Grid item xs={12} md={6} key={name}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {name.replace('-', ' ').toUpperCase()}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Chip
                            label={task.running ? 'Running' : 'Stopped'}
                            color={task.running ? 'success' : 'error'}
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            Next: {task.nextDate}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Test Notification Dialog */}
      <Dialog
        open={testNotificationOpen}
        onClose={() => setTestNotificationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Test Notification</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Notification Type</InputLabel>
            <Select
              value={testNotificationData.type || ''}
              onChange={(e) =>
                setTestNotificationData({
                  ...testNotificationData,
                  type: e.target.value,
                })
              }
              label="Notification Type"
            >
              <MenuItem value="carrierUpdate">Carrier Update</MenuItem>
              <MenuItem value="orderStatus">Order Status</MenuItem>
              <MenuItem value="systemAlert">System Alert</MenuItem>
              <MenuItem value="dailyReport">Daily Report</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={testNotificationData.priority || 'medium'}
              onChange={(e) =>
                setTestNotificationData({
                  ...testNotificationData,
                  priority: e.target.value,
                })
              }
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Test Data (JSON)"
            value={testNotificationData.data || ''}
            onChange={(e) =>
              setTestNotificationData({
                ...testNotificationData,
                data: e.target.value,
              })
            }
            placeholder='{"key": "value"}'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestNotificationOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleTestNotification(testNotificationData)}
            variant="contained"
            disabled={testNotificationMutation.isPending}
          >
            {testNotificationMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              'Send Test'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.telegram}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      telegram: e.target.checked,
                    })
                  }
                />
              }
              label="Telegram Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.email}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      email: e.target.checked,
                    })
                  }
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.realtime}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      realtime: e.target.checked,
                    })
                  }
                />
              }
              label="Real-time Notifications"
            />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.dailyReport}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      dailyReport: e.target.checked,
                    })
                  }
                />
              }
              label="Daily Reports"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.weeklyReport}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      weeklyReport: e.target.checked,
                    })
                  }
                />
              }
              label="Weekly Reports"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.monthlyReport}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      monthlyReport: e.target.checked,
                    })
                  }
                />
              }
              label="Monthly Reports"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      systemAlerts: e.target.checked,
                    })
                  }
                />
              }
              label="System Alerts"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationDashboard;
