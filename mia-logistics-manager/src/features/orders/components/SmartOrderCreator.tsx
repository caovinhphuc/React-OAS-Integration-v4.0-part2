// src/features/orders/components/SmartOrderCreator.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AdvancedPricingEngine,
  PricingContext,
} from '@/services/pricing/pricingEngine';
import { IntelligentVehicleSelector } from '@/services/vehicles/vehicleSelector';
import { SmartConsolidationEngine } from '@/services/consolidation/consolidationEngine';
import { useActiveCarriers } from '@/features/carriers/hooks/useCarriers';
import { useOrders } from '@/features/orders/hooks/useOrders';

interface SmartOrderCreatorProps {
  open: boolean;
  onClose: () => void;
}

const SmartOrderCreator: React.FC<SmartOrderCreatorProps> = ({
  open,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [orderData] = useState<any>({});
  const [pricingOptions, setPricingOptions] = useState<any[]>([]);
  const [vehicleRecommendations, setVehicleRecommendations] = useState<any[]>(
    []
  );
  const [consolidationOpportunities, setConsolidationOpportunities] = useState<
    any[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: carriers } = useActiveCarriers();
  const { data: existingOrders } = useOrders();

  const pricingEngine = new AdvancedPricingEngine();
  const vehicleSelector = new IntelligentVehicleSelector();
  const consolidationEngine = new SmartConsolidationEngine();

  const steps = [
    'Thông tin cơ bản',
    'Phân tích thông minh',
    'Tối ưu hóa',
    'Xác nhận',
  ];

  useEffect(() => {
    if (
      activeStep === 1 &&
      orderData.pickupAddress &&
      orderData.deliveryAddress
    ) {
      analyzeOrderRequirements();
    }
  }, [activeStep, orderData]);

  const analyzeOrderRequirements = async () => {
    setIsAnalyzing(true);

    try {
      // Create pricing context
      const context: PricingContext = {
        distance: 15, // Would be calculated from geocoding
        volume: orderData.totalVolume || 1,
        weight: orderData.totalWeight || 10,
        packageCount: orderData.packageCount || 1,
        serviceLevel: orderData.serviceLevel || 'STANDARD',
        pickupLocation: orderData.pickupAddress,
        deliveryLocation: orderData.deliveryAddress,
        scheduledDate: new Date(),
        isRemoteArea: false, // Would be determined by address analysis
        requiresInsurance: orderData.requiresInsurance || false,
        fragileItems: orderData.fragileItems || false,
        oversizeItems: false,
      };

      // Get pricing options from all carriers
      if (carriers) {
        const pricingComparisons = pricingEngine.compareCarrierPricing(
          context,
          carriers
        );
        setPricingOptions(pricingComparisons);
      }

      // Get vehicle recommendations
      const mockPackages = [
        {
          id: '1',
          sku: 'VALI-M-001',
          name: 'Vali size M',
          category: 'vali' as const,
          size: 'M' as const,
          dimensions: { length: 60, width: 40, height: 25 },
          weight: orderData.totalWeight || 10,
          quantity: orderData.packageCount || 1,
          fragile: orderData.fragileItems || false,
          stackable: true,
        },
      ];

      const vehicleRecs = vehicleSelector.recommendVehicles(
        mockPackages,
        context
      );
      setVehicleRecommendations(vehicleRecs.slice(0, 3));

      // Check consolidation opportunities
      if (existingOrders) {
        const opportunities =
          consolidationEngine.analyzeConsolidationOpportunities([
            ...existingOrders,
            orderData as any,
          ]);
        setConsolidationOpportunities(opportunities.slice(0, 2));
      }
    } catch (error) {
      console.error('Error analyzing order requirements:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderAnalysisStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Phân tích thông minh cho đơn hàng
      </Typography>

      {isAnalyzing ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Đang phân tích tối ưu...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Pricing Analysis */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  So sánh giá vận chuyển
                </Typography>
                {pricingOptions.map((option, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="subtitle1">
                          {option.carrier.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.carrier.pricingMethod.replace('_', ' ')} -
                          Điểm: {option.score.toFixed(1)}/100
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" color="primary">
                          {formatCurrency(option.pricing.finalTotal)}
                        </Typography>
                        <Typography variant="caption">
                          Tiết kiệm:{' '}
                          {formatCurrency(
                            option.pricing.totalBeforeTax -
                              option.pricing.finalTotal
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Vehicle Recommendations */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Đề xuất phương tiện
                </Typography>
                {vehicleRecommendations.map((rec, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="subtitle1">
                          {rec.vehicleType.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Điểm phù hợp: {rec.score.toFixed(1)}/100
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {rec.reasons.slice(0, 2).map((reason: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={reason}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6">
                          {formatCurrency(rec.estimatedCost)}
                        </Typography>
                        <Typography variant="caption">
                          Sử dụng: {rec.capacityUtilization.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    {rec.warnings.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        {rec.warnings[0]}
                      </Alert>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Consolidation Opportunities */}
          {consolidationOpportunities.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cơ hội gộp chuyến
                  </Typography>
                  {consolidationOpportunities.map((opp, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            Gộp với {opp.orders.length - 1} đơn hàng khác
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Điểm tương thích:{' '}
                            {opp.compatibility.score.toFixed(1)}/100
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {opp.compatibility.benefits
                              .slice(0, 2)
                              .map((benefit: string, idx: number) => (
                                <Chip
                                  key={idx}
                                  label={benefit}
                                  size="small"
                                  color="success"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                          </Box>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="h6" color="success.main">
                            Tiết kiệm: {formatCurrency(opp.estimatedSavings)}
                          </Typography>
                          <Typography variant="caption">
                            Thể tích: {opp.totalVolume.toFixed(1)}m³
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );

  const renderOptimizationStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tối ưu hóa đơn hàng
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Khuyến nghị tối ưu
              </Typography>

              {pricingOptions.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Khuyến nghị: Chọn {pricingOptions[0].carrier.name} với giá{' '}
                  {formatCurrency(pricingOptions[0].pricing.finalTotal)}
                  để có tỷ lệ giá/chất lượng tốt nhất.
                </Alert>
              )}

              {vehicleRecommendations.length > 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Phương tiện phù hợp nhất:{' '}
                  {vehicleRecommendations[0].vehicleType.name}
                  với mức sử dụng{' '}
                  {vehicleRecommendations[0].capacityUtilization.toFixed(1)}%
                </Alert>
              )}

              {consolidationOpportunities.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Có thể tiết kiệm{' '}
                  {formatCurrency(
                    consolidationOpportunities[0].estimatedSavings
                  )}
                  bằng cách gộp chuyến với{' '}
                  {consolidationOpportunities[0].orders.length - 1} đơn hàng
                  khác.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Tạo đơn hàng thông minh</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            {/* Basic order form - simplified for brevity */}
            <Typography>Nhập thông tin đơn hàng cơ bản...</Typography>
          </Box>
        )}

        {activeStep === 1 && renderAnalysisStep()}
        {activeStep === 2 && renderOptimizationStep()}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h6">Xác nhận đơn hàng</Typography>
            <Typography>Xem lại và xác nhận thông tin đơn hàng...</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep((prev) => prev - 1)}>
            Quay lại
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
            disabled={isAnalyzing}
          >
            Tiếp theo
          </Button>
        ) : (
          <Button variant="contained">Tạo đơn hàng</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SmartOrderCreator;
