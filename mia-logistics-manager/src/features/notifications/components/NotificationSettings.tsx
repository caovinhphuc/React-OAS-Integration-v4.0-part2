// src/features/notifications/components/NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  FormGroup,
  TextField,
  Button,
  Chip,
  Alert,
  Grid,
  Divider,
  TimePicker,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface NotificationSettingsProps {
  userId: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
}) => {
  const [preferences, setPreferences] = useState<any>({
    channels: {
      telegram: {
        enabled: false,
        chatId: '',
        events: [],
      },
      email: {
        enabled: false,
        address: '',
        events: [],
      },
    },
    quietHours: {
      start: '22:00',
      end: '07:00',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    language: 'vi',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const eventTypes = [
    {
      id: 'order_created',
      name: 'Đơn hàng mới',
      description: 'Khi có đơn hàng mới được tạo',
    },
    {
      id: 'order_confirmed',
      name: 'Xác nhận đơn hàng',
      description: 'Khi đơn hàng được xác nhận',
    },
    {
      id: 'order_pickup',
      name: 'Lấy hàng',
      description: 'Khi hàng đã được lấy',
    },
    {
      id: 'order_delivered',
      name: 'Giao hàng',
      description: 'Khi hàng đã được giao',
    },
    {
      id: 'weekly_report',
      name: 'Báo cáo tuần',
      description: 'Báo cáo tổng kết hàng tuần',
    },
    {
      id: 'monthly_report',
      name: 'Báo cáo tháng',
      description: 'Báo cáo tổng kết hàng tháng',
    },
    {
      id: 'system_alert',
      name: 'Cảnh báo hệ thống',
      description: 'Thông báo lỗi hệ thống',
    },
  ];

  useEffect(() => {
    loadUserPreferences();
  }, [userId]);

  const loadUserPreferences = async () => {
    try {
      // Mock load preferences - integrate with notification service
      const mockPreferences = {
        channels: {
          telegram: {
            enabled: true,
            chatId: '123456789',
            events: ['order_created', 'order_confirmed', 'order_delivered'],
          },
          email: {
            enabled: true,
            address: 'user@mia.vn',
            events: ['weekly_report', 'monthly_report'],
          },
        },
        quietHours: {
          start: '22:00',
          end: '07:00',
          timezone: 'Asia/Ho_Chi_Minh',
        },
        language: 'vi',
      };
      setPreferences(mockPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleChannelToggle = (channel: string, enabled: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          enabled,
        },
      },
    }));
  };

  const handleEventToggle = (
    channel: string,
    eventId: string,
    enabled: boolean
  ) => {
    setPreferences((prev: any) => {
      const currentEvents = prev.channels[channel]?.events || [];
      const newEvents = enabled
        ? [...currentEvents, eventId]
        : currentEvents.filter((e: string) => e !== eventId);

      return {
        ...prev,
        channels: {
          ...prev.channels,
          [channel]: {
            ...prev.channels[channel],
            events: newEvents,
          },
        },
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock save - integrate with notification service
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testTelegramConnection = async () => {
    try {
      // Mock test - integrate with telegram service
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('✅ Kết nối Telegram thành công!');
    } catch (error) {
      alert('❌ Lỗi kết nối Telegram');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cài đặt thông báo
      </Typography>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Cài đặt đã được lưu thành công!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Telegram Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TelegramIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Telegram</Typography>
                <Box ml="auto">
                  <Switch
                    checked={preferences.channels.telegram?.enabled || false}
                    onChange={(e) =>
                      handleChannelToggle('telegram', e.target.checked)
                    }
                  />
                </Box>
              </Box>

              {preferences.channels.telegram?.enabled && (
                <>
                  <TextField
                    fullWidth
                    label="Chat ID"
                    value={preferences.channels.telegram?.chatId || ''}
                    onChange={(e) =>
                      setPreferences((prev: any) => ({
                        ...prev,
                        channels: {
                          ...prev.channels,
                          telegram: {
                            ...prev.channels.telegram,
                            chatId: e.target.value,
                          },
                        },
                      }))
                    }
                    helperText="Nhắn /start cho @MiaLogisticsBot để lấy Chat ID"
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="outlined"
                    onClick={testTelegramConnection}
                    sx={{ mb: 2 }}
                  >
                    Kiểm tra kết nối
                  </Button>

                  <Typography variant="subtitle2" gutterBottom>
                    Loại thông báo:
                  </Typography>
                  <FormGroup>
                    {eventTypes.map((event) => (
                      <FormControlLabel
                        key={event.id}
                        control={
                          <Switch
                            size="small"
                            checked={
                              preferences.channels.telegram?.events?.includes(
                                event.id
                              ) || false
                            }
                            onChange={(e) =>
                              handleEventToggle(
                                'telegram',
                                event.id,
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              {event.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {event.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Email Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Email</Typography>
                <Box ml="auto">
                  <Switch
                    checked={preferences.channels.email?.enabled || false}
                    onChange={(e) =>
                      handleChannelToggle('email', e.target.checked)
                    }
                  />
                </Box>
              </Box>

              {preferences.channels.email?.enabled && (
                <>
                  <TextField
                    fullWidth
                    label="Địa chỉ email"
                    type="email"
                    value={preferences.channels.email?.address || ''}
                    onChange={(e) =>
                      setPreferences((prev: any) => ({
                        ...prev,
                        channels: {
                          ...prev.channels,
                          email: {
                            ...prev.channels.email,
                            address: e.target.value,
                          },
                        },
                      }))
                    }
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle2" gutterBottom>
                    Loại thông báo:
                  </Typography>
                  <FormGroup>
                    {eventTypes.map((event) => (
                      <FormControlLabel
                        key={event.id}
                        control={
                          <Switch
                            size="small"
                            checked={
                              preferences.channels.email?.events?.includes(
                                event.id
                              ) || false
                            }
                            onChange={(e) =>
                              handleEventToggle(
                                'email',
                                event.id,
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              {event.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {event.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quiet Hours Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Giờ nghỉ</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Không gửi thông báo trong khoảng thời gian này (trừ thông báo
                khẩn cấp)
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Bắt đầu"
                    type="time"
                    value={preferences.quietHours?.start || '22:00'}
                    onChange={(e) =>
                      setPreferences((prev: any) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours,
                          start: e.target.value,
                        },
                      }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Kết thúc"
                    type="time"
                    value={preferences.quietHours?.end || '07:00'}
                    onChange={(e) =>
                      setPreferences((prev: any) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours,
                          end: e.target.value,
                        },
                      }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Múi giờ</InputLabel>
                    <Select
                      value={
                        preferences.quietHours?.timezone || 'Asia/Ho_Chi_Minh'
                      }
                      onChange={(e) =>
                        setPreferences((prev: any) => ({
                          ...prev,
                          quietHours: {
                            ...prev.quietHours,
                            timezone: e.target.value,
                          },
                        }))
                      }
                    >
                      <MenuItem value="Asia/Ho_Chi_Minh">
                        Vietnam (GMT+7)
                      </MenuItem>
                      <MenuItem value="UTC">UTC (GMT+0)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          size="large"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
