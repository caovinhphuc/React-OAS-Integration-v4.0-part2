// src/features/dashboard/Dashboard.tsx

import {
  Assessment,
  Inventory,
  LocalShipping,
  TrendingUp
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';

const Dashboard: React.FC = () => {
  const stats = [
    { title: 'Tổng đơn hàng', value: '1,234', icon: Assessment, color: '#1976d2' },
    { title: 'Đang vận chuyển', value: '56', icon: LocalShipping, color: '#f57c00' },
    { title: 'Hàng tồn kho', value: '2,890', icon: Inventory, color: '#388e3c' },
    { title: 'Doanh thu tháng', value: '₫45.2M', icon: TrendingUp, color: '#7b1fa2' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard - Tổng quan
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid key={index} item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Icon sx={{ color: stat.color, fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ vận chuyển theo tháng
            </Typography>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              height="100%"
              color="text.secondary"
            >
              [Chart sẽ được implement ở Phase 2]
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <Box color="text.secondary">
              [Activity feed sẽ được implement ở Phase 2]
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;