import React from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { LocationOn, Refresh, BugReport } from '@mui/icons-material';
import { DistanceService } from '../services/distanceService';

interface DistanceDisplayProps {
  distances: { [stopKey: string]: number };
  selectedStopPoints: Set<string>;
  stopPoints: { [key: string]: any };
  locations: any[];
  pickupLocation: string;
  isCalculating: boolean;
  error: string | null;
  formatDecimal: (value: number, decimals: number) => string;
  onRecalculate?: () => void;
  onTestConnectivity?: () => void;
}

export const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  distances,
  selectedStopPoints,
  stopPoints,
  locations,
  pickupLocation,
  isCalculating,
  error,
  formatDecimal,
  onRecalculate,
  onTestConnectivity,
}) => {
  if (selectedStopPoints.size === 0) {
    return null;
  }

  if (error) {
    return (
      <Box mb={2}>
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box mb={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="subtitle2" fontWeight={600} color="primary">
          🛣️ Chiều dài quãng đường từng đoạn:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onRecalculate && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRecalculate}
              disabled={isCalculating}
              sx={{
                fontSize: '0.75rem',
                py: 0.5,
                px: 1,
              }}
            >
              Tính lại
            </Button>
          )}
          {onTestConnectivity && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<BugReport />}
              onClick={onTestConnectivity}
              disabled={isCalculating}
              sx={{
                fontSize: '0.75rem',
                py: 0.5,
                px: 1,
                color: 'warning.main',
                borderColor: 'warning.main',
                '&:hover': {
                  borderColor: 'warning.dark',
                  backgroundColor: 'warning.50',
                },
              }}
            >
              Test
            </Button>
          )}
        </Box>
      </Box>

      {isCalculating ? (
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            p: 1,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Đang tính khoảng cách...
          </Typography>
        </Box>
      ) : (
        <Box>
          {Array.from(selectedStopPoints).map((stopKey, index) => {
            const stopPoint = stopPoints[stopKey];
            const distance = distances[stopKey];

            return (
              <Box
                key={stopKey}
                mb={1}
                sx={{
                  p: 1.5,
                  bgcolor: 'primary.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'primary.200',
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={600} color="primary">
                    Điểm dừng {index + 1}:
                  </Typography>
                  <Chip
                    label={
                      distance && distance > 0
                        ? `${formatDecimal(distance, 1)} km`
                        : 'Đang tính...'
                    }
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>

                {distance && distance > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {index === 0
                        ? 'Từ điểm nguồn đến điểm dừng 1'
                        : `Từ điểm dừng ${index} đến điểm dừng ${index + 1}`}
                    </Typography>
                    <Box
                      sx={{
                        display: 'block',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: 'primary.main',
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          index === 0
                            ? `${(() => {
                                const pickupLocationData = locations.find(
                                  (loc) => loc.id === pickupLocation
                                );
                                return pickupLocationData
                                  ? `${pickupLocationData.address}, ${pickupLocationData.ward}, ${pickupLocationData.district}, ${pickupLocationData.province}`
                                  : 'Điểm nguồn';
                              })()} <span style="color: #ff9800; font-weight: 600;">→</span> ${stopPoint?.address || 'Điểm dừng 1'}`
                            : `${stopPoints[Array.from(selectedStopPoints)[index - 1]]?.address || `Điểm dừng ${index}`} <span style="color: #ff9800; font-weight: 600;">→</span> ${stopPoint?.address || `Điểm dừng ${index + 1}`}`,
                      }}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
