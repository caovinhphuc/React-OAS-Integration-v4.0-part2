import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  Speed,
  LocalShipping,
  TrendingUp,
} from '@mui/icons-material';
import {
  useBusinessLogic,
  usePricingOptimization,
  useConsolidationOptimization,
} from '@/hooks/business/useBusinessLogic';
import { BUSINESS_CONFIG } from '@/config/businessConfig';

const BusinessLogicDemo: React.FC = () => {
  const {
    getVehicleRecommendations,
    getPerformanceReport,
    clearPerformanceMetrics,
    isLoading,
    error,
  } = useBusinessLogic();

  const { optimizePricing } = usePricingOptimization();
  const { optimizeConsolidation } = useConsolidationOptimization();

  const [demoResults, setDemoResults] = useState<any>(null);

  const runPricingDemo = async () => {
    const mockContext = {
      distance: 150,
      volume: 2.5,
      weight: 25,
      packageCount: 3,
      serviceLevel: 'STANDARD' as const,
      pickupLocation: 'Hà Nội',
      deliveryLocation: 'TP.HCM',
      scheduledDate: new Date(),
      isRemoteArea: false,
      requiresInsurance: false,
      fragileItems: false,
      oversizeItems: false,
    };

    const mockCarriers = [
      {
        carrierId: 'CAR-001',
        name: 'Express Logistics',
        pricingMethod: 'PER_KM' as const,
        baseRate: 50000,
        perKmRate: 5000,
        fuelSurcharge: 0.1,
        insuranceRate: 0.005,
        remoteAreaFee: 20000,
        isActive: true,
        rating: 4.5,
      } as any,
      {
        carrierId: 'CAR-002',
        name: 'Economy Transport',
        pricingMethod: 'PER_M3' as const,
        baseRate: 30000,
        perM3Rate: 80000,
        fuelSurcharge: 0.08,
        insuranceRate: 0.003,
        remoteAreaFee: 15000,
        isActive: true,
        rating: 4.2,
      } as any,
    ];

    try {
      const result = await optimizePricing(mockContext, mockCarriers, 'cost');
      setDemoResults({ type: 'pricing', data: result });
    } catch (err) {
      console.error('Pricing demo failed:', err);
    }
  };

  const runVehicleDemo = async () => {
    const mockPackages = [
      {
        id: '1',
        sku: 'VALI-M-001',
        name: 'Vali size M',
        category: 'vali' as const,
        size: 'M' as const,
        dimensions: { length: 60, width: 40, height: 25 },
        weight: 15,
        quantity: 2,
        fragile: false,
        stackable: true,
      },
    ];

    const mockContext = {
      distance: 50,
      volume: 1.5,
      weight: 30,
      packageCount: 2,
      serviceLevel: 'STANDARD' as const,
      pickupLocation: 'Hà Nội',
      deliveryLocation: 'Hải Phòng',
      scheduledDate: new Date(),
      isRemoteArea: false,
      requiresInsurance: false,
      fragileItems: false,
      oversizeItems: false,
    };

    try {
      const result = await getVehicleRecommendations(
        mockPackages,
        mockContext,
        {
          prioritizeCost: true,
          prioritizeSpeed: false,
        }
      );
      setDemoResults({ type: 'vehicle', data: result });
    } catch (err) {
      console.error('Vehicle demo failed:', err);
    }
  };

  const runConsolidationDemo = async () => {
    const mockOrders = [
      {
        orderId: 'ORD-001',
        customerName: 'Customer A',
        customerEmail: 'customerA@example.com',
        customerPhone: '0123456789',
        pickupAddress: 'Hà Nội',
        deliveryAddress: 'TP.HCM',
        totalWeight: 20,
        totalVolume: 2,
        packageCount: 2,
        serviceLevel: 'STANDARD',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        orderId: 'ORD-002',
        customerName: 'Customer B',
        customerEmail: 'customerB@example.com',
        customerPhone: '0987654321',
        pickupAddress: 'Hà Nội',
        deliveryAddress: 'TP.HCM',
        totalWeight: 15,
        totalVolume: 1.5,
        packageCount: 1,
        serviceLevel: 'STANDARD',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as any[];

    try {
      const result = await optimizeConsolidation(mockOrders, 3);
      setDemoResults({ type: 'consolidation', data: result });
    } catch (err) {
      console.error('Consolidation demo failed:', err);
    }
  };

  const runPerformanceDemo = () => {
    const report = getPerformanceReport();
    setDemoResults({ type: 'performance', data: report });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧠 Business Logic Demo
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Demo các tính năng business logic đã được implement trong Phase 3
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Demo Controls */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎮 Demo Controls
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<TrendingUp />}
                  onClick={runPricingDemo}
                  disabled={isLoading}
                >
                  Pricing Demo
                </Button>
                <Button
                  variant="contained"
                  startIcon={<LocalShipping />}
                  onClick={runVehicleDemo}
                  disabled={isLoading}
                >
                  Vehicle Demo
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Speed />}
                  onClick={runConsolidationDemo}
                  disabled={isLoading}
                >
                  Consolidation Demo
                </Button>
                <Button variant="outlined" onClick={runPerformanceDemo}>
                  Performance Report
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => clearPerformanceMetrics()}
                >
                  Clear Metrics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Loading State */}
        {isLoading && (
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              p={3}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
                Đang xử lý business logic...
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Demo Results */}
        {demoResults && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Demo Results - {demoResults.type.toUpperCase()}
                </Typography>

                {demoResults.type === 'pricing' && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Best Pricing Option:
                    </Typography>
                    <Box
                      sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}
                    >
                      <Typography variant="h6" color="primary">
                        {demoResults.data.bestOption.carrier.name}
                      </Typography>
                      <Typography variant="body2">
                        Price:{' '}
                        {formatCurrency(
                          demoResults.data.bestOption.pricing.finalTotal
                        )}
                      </Typography>
                      <Typography variant="body2">
                        Score: {demoResults.data.bestOption.score.toFixed(1)}
                        /100
                      </Typography>
                    </Box>
                  </Box>
                )}

                {demoResults.type === 'vehicle' && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Vehicle Recommendations:
                    </Typography>
                    {demoResults.data
                      .slice(0, 3)
                      .map((rec: any, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle2">
                            {rec.vehicleType.name}
                          </Typography>
                          <Typography variant="body2">
                            Score: {rec.score.toFixed(1)}/100 | Cost:{' '}
                            {formatCurrency(rec.estimatedCost)}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                )}

                {demoResults.type === 'consolidation' && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Consolidation Opportunities:
                    </Typography>
                    <Typography variant="body2">
                      Total Opportunities: {demoResults.data.totalOpportunities}
                    </Typography>
                    <Typography variant="body2">
                      Potential Savings:{' '}
                      {formatCurrency(demoResults.data.totalPotentialSavings)}
                    </Typography>
                  </Box>
                )}

                {demoResults.type === 'performance' && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Performance Report:
                    </Typography>
                    <pre
                      style={{
                        backgroundColor: '#f5f5f5',
                        padding: '1rem',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                      }}
                    >
                      {demoResults.data}
                    </pre>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Configuration */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">⚙️ Business Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pricing Configuration:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Tax Rate: {BUSINESS_CONFIG.PRICING.TAX_RATE * 100}%
                    </Typography>
                    <Typography variant="body2">
                      Dimensional Factor:{' '}
                      {BUSINESS_CONFIG.PRICING.DIMENSIONAL_FACTOR}
                    </Typography>
                    <Typography variant="body2">
                      Default Fuel Surcharge:{' '}
                      {BUSINESS_CONFIG.PRICING.DEFAULT_FUEL_SURCHARGE * 100}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Optimization Configuration:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Population Size:{' '}
                      {
                        BUSINESS_CONFIG.ROUTING.GENETIC_ALGORITHM
                          .POPULATION_SIZE
                      }
                    </Typography>
                    <Typography variant="body2">
                      Max Generations:{' '}
                      {
                        BUSINESS_CONFIG.ROUTING.GENETIC_ALGORITHM
                          .MAX_GENERATIONS
                      }
                    </Typography>
                    <Typography variant="body2">
                      Min Savings Threshold:{' '}
                      {formatCurrency(
                        BUSINESS_CONFIG.CONSOLIDATION.MIN_SAVINGS_THRESHOLD
                      )}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessLogicDemo;
