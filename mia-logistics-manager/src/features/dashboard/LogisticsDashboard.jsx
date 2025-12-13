// src/features/dashboard/LogisticsDashboard.jsx
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { LineChart, BarChart, PieChart } from 'recharts';

const LogisticsDashboard = () => {
  const kpiData = useLogisticsKPI();

  return (
    <Grid container spacing={3}>
      {/* Shipping Volume Trends */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6">Xu Hướng Vận Chuyển (m³/ngày)</Typography>
            <LineChart width={600} height={300} data={kpiData.volumeTrends}>
              <Line dataKey="vali" stroke="#1976d2" name="Vali" />
              <Line dataKey="balo" stroke="#388e3c" name="Balo" />
              <Line dataKey="tuiXach" stroke="#f57c00" name="Túi xách" />
            </LineChart>
          </CardContent>
        </Card>
      </Grid>

      {/* Cost Efficiency Metrics */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Chi Phí/m³ Theo Loại</Typography>
            <PieChart width={300} height={300}>
              <Pie data={kpiData.costBreakdown} />
            </PieChart>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
