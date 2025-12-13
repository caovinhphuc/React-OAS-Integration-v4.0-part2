// src/features/orders/components/CreateOrderDialog.tsx
import { useActiveCarriers } from '@/features/carriers/hooks/useCarriers';
import { Order } from '@/services/googleSheets/ordersService';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useCreateOrder } from '../hooks/useOrders';

const orderSchema = yup.object({
  customerName: yup.string().required('Tên khách hàng là bắt buộc'),
  customerEmail: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  customerPhone: yup.string().required('Số điện thoại là bắt buộc'),
  pickupAddress: yup.string().required('Địa chỉ lấy hàng là bắt buộc'),
  deliveryAddress: yup.string().required('Địa chỉ giao hàng là bắt buộc'),
  totalWeight: yup
    .number()
    .positive('Khối lượng phải lớn hơn 0')
    .required('Khối lượng là bắt buộc'),
  totalVolume: yup
    .number()
    .positive('Thể tích phải lớn hơn 0')
    .required('Thể tích là bắt buộc'),
  packageCount: yup
    .number()
    .positive('Số kiện phải lớn hơn 0')
    .required('Số kiện là bắt buộc'),
  serviceLevel: yup.string().required('Mức dịch vụ là bắt buộc'),
  carrierId: yup.string(),
  notes: yup.string(),
});

type OrderFormData = yup.InferType<typeof orderSchema>;

interface CreateOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = ['Thông tin khách hàng', 'Chi tiết vận chuyển', 'Xác nhận'];

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({
  open,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const { data: carriers } = useActiveCarriers();
  const createOrderMutation = useCreateOrder();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<OrderFormData>({
    resolver: yupResolver(orderSchema) as any,
    defaultValues: {
      serviceLevel: 'STANDARD',
      packageCount: 1,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setEstimatedCost(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      await createOrderMutation.mutateAsync({
        ...data,
        status: 'PENDING',
      } as Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>);
      handleClose();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Thông tin khách hàng
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="customerName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tên khách hàng"
                    error={!!errors.customerName}
                    helperText={errors.customerName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="customerEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.customerEmail}
                    helperText={errors.customerEmail?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="customerPhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Số điện thoại"
                    error={!!errors.customerPhone}
                    helperText={errors.customerPhone?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Chi tiết vận chuyển
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="pickupAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Địa chỉ lấy hàng"
                    multiline
                    rows={2}
                    error={!!errors.pickupAddress}
                    helperText={errors.pickupAddress?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="deliveryAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Địa chỉ giao hàng"
                    multiline
                    rows={2}
                    error={!!errors.deliveryAddress}
                    helperText={errors.deliveryAddress?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller
                name="totalWeight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Khối lượng (kg)"
                    type="number"
                    error={!!errors.totalWeight}
                    helperText={errors.totalWeight?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller
                name="totalVolume"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Thể tích (m³)"
                    type="number"
                    inputProps={{ step: 0.1 }}
                    error={!!errors.totalVolume}
                    helperText={errors.totalVolume?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="packageCount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Số kiện"
                    type="number"
                    error={!!errors.packageCount}
                    helperText={errors.packageCount?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceLevel"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Mức dịch vụ</InputLabel>
                    <Select {...field} label="Mức dịch vụ">
                      <MenuItem value="STANDARD">Tiêu chuẩn</MenuItem>
                      <MenuItem value="EXPRESS">Hỏa tốc</MenuItem>
                      <MenuItem value="ECONOMY">Tiết kiệm</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="carrierId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Nhà vận chuyển</InputLabel>
                    <Select {...field} label="Nhà vận chuyển">
                      <MenuItem value="">Tự động chọn</MenuItem>
                      {carriers?.map((carrier) => (
                        <MenuItem
                          key={carrier.carrierId}
                          value={carrier.carrierId}
                        >
                          {carrier.name} -{' '}
                          {carrier.pricingMethod.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Ghi chú"
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Xác nhận đơn hàng
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Thông tin khách hàng:
                </Typography>
                <Typography variant="body2">
                  {watchedValues.customerName} - {watchedValues.customerPhone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {watchedValues.customerEmail}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chi tiết vận chuyển:
                </Typography>
                <Typography variant="body2">
                  <strong>Từ:</strong> {watchedValues.pickupAddress}
                </Typography>
                <Typography variant="body2">
                  <strong>Đến:</strong> {watchedValues.deliveryAddress}
                </Typography>
                <Typography variant="body2">
                  <strong>Khối lượng:</strong> {watchedValues.totalWeight} kg
                </Typography>
                <Typography variant="body2">
                  <strong>Thể tích:</strong> {watchedValues.totalVolume} m³
                </Typography>
                <Typography variant="body2">
                  <strong>Số kiện:</strong> {watchedValues.packageCount}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Tạo đơn hàng mới</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {createOrderMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit as any)}>
          {renderStepContent(activeStep)}
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        {activeStep > 0 && <Button onClick={handleBack}>Quay lại</Button>}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext} disabled={!isValid}>
            Tiếp theo
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={createOrderMutation.isPending}
            onClick={handleSubmit(onSubmit as any)}
          >
            {createOrderMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              'Tạo đơn hàng'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderDialog;
