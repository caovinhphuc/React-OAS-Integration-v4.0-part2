import { useState, useCallback } from 'react';
import { DistanceService } from '../services/distanceService';
import { getFallbackDistance } from '../config/mapsConfig';

interface DistanceCalculationResult {
  distances: { [stopKey: string]: number };
  totalDistance: number;
  isCalculating: boolean;
  error: string | null;
}

export const useDistanceCalculation = () => {
  const [distances, setDistances] = useState<{ [stopKey: string]: number }>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateStopDistances = useCallback(
    async (
      pickupLocation: any,
      selectedStopPoints: Set<string>,
      stopPoints: { [key: string]: any },
      locations: any[]
    ): Promise<DistanceCalculationResult> => {
      if (!pickupLocation || selectedStopPoints.size === 0) {
        return {
          distances: {},
          totalDistance: 0,
          isCalculating: false,
          error: null,
        };
      }

      setIsCalculating(true);
      setError(null);
      const newDistances: { [stopKey: string]: number } = {};

      try {
        // Lấy địa chỉ điểm nguồn
        const pickupLocationData = locations.find(
          (loc) => loc.id === pickupLocation
        );
        if (!pickupLocationData) {
          throw new Error('Không tìm thấy điểm nguồn');
        }

        const origin = `${pickupLocationData.address}, ${pickupLocationData.ward}, ${pickupLocationData.district}, ${pickupLocationData.province}`;
        let currentOrigin = origin;

        // Tính khoảng cách theo thứ tự điểm dừng
        const stopPointsArray = Array.from(selectedStopPoints);
        for (let i = 0; i < stopPointsArray.length; i++) {
          const stopKey = stopPointsArray[i];
          const stopPoint = stopPoints[stopKey];
          if (!stopPoint) continue;

          // Tìm địa chỉ đầy đủ từ mã điểm dừng trong Locations
          const destinationLocation = locations.find(
            (loc) => loc.id === stopPoint.address
          );
          const destinationAddress = destinationLocation
            ? `${destinationLocation.address}, ${destinationLocation.ward}, ${destinationLocation.district}, ${destinationLocation.province}`
            : stopPoint.address;

          // Tính khoảng cách từ điểm hiện tại đến điểm dừng này
          console.log(
            `🔄 Calculating distance from ${currentOrigin} to ${stopKey}: ${destinationAddress}`
          );
          const result = await DistanceService.calculateDistance(
            currentOrigin,
            destinationAddress
          );

          let segmentDistance = 0;

          if (result.success && result.distance && result.distance > 0) {
            segmentDistance = result.distance;
            console.log(
              `✅ Google Apps Script distance: ${segmentDistance.toFixed(2)} km`
            );
          } else {
            // Fallback: Sử dụng khoảng cách thực tế từ config nếu Google Apps Script không hoạt động
            console.log(
              '⚠️ Google Apps Script not available, trying fallback distances'
            );
            console.log(`❌ Google Apps Script error: ${result.error}`);

            const fallbackDistance = getFallbackDistance(
              currentOrigin,
              destinationAddress
            );

            if (fallbackDistance > 0 && fallbackDistance !== 10.0) {
              segmentDistance = fallbackDistance;
              console.log(
                `✅ Using fallback distance: ${segmentDistance.toFixed(2)} km`
              );
            } else {
              // Không sử dụng 10km mặc định, thay vào đó báo lỗi
              console.error('❌ No valid fallback distance found');
              throw new Error(
                `Không thể tính khoảng cách từ "${currentOrigin}" đến "${destinationAddress}". Vui lòng kiểm tra địa chỉ hoặc thử lại sau.`
              );
            }
          }

          // Lưu khoảng cách của từng đoạn riêng biệt
          newDistances[stopKey] = segmentDistance;

          console.log(
            `✅ Segment distance for stop ${i + 1}: ${segmentDistance.toFixed(2)} km`
          );

          // Cập nhật điểm xuất phát cho đoạn tiếp theo
          currentOrigin = destinationAddress;
        }

        // Tính tổng khoảng cách
        const totalDistance = Object.values(newDistances).reduce(
          (sum, distance) => sum + distance,
          0
        );

        setDistances(newDistances);
        console.log('✅ All stop point distances calculated:', newDistances);
        console.log('✅ Total distance:', totalDistance);

        return {
          distances: newDistances,
          totalDistance,
          isCalculating: false,
          error: null,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi tính khoảng cách';
        setError(errorMessage);
        console.error('❌ Error calculating stop point distances:', error);
        return {
          distances: {},
          totalDistance: 0,
          isCalculating: false,
          error: errorMessage,
        };
      } finally {
        setIsCalculating(false);
      }
    },
    []
  );

  const getDistancePayload = useCallback(
    (
      selectedStopPoints: Set<string>,
      distances: { [stopKey: string]: number }
    ) => {
      const stopDistances: { [key: string]: number } = {};
      const totalDistance = Object.values(distances).reduce(
        (sum, distance) => sum + distance,
        0
      );

      // Map khoảng cách theo thứ tự điểm dừng
      Array.from(selectedStopPoints).forEach((stopKey, index) => {
        const distanceForStop = distances[stopKey] || 0;
        stopDistances[`distance${index + 1}`] = Number(
          distanceForStop.toFixed(2)
        );

        console.log(
          `🔍 DEBUG - Mapping distance: stopKey=${stopKey}, index=${index}, distance=${distanceForStop}`
        );
      });

      console.log('🔍 DEBUG - Distance payload:', {
        ...stopDistances,
        totalDistance: Number(totalDistance.toFixed(2)),
      });

      return {
        ...stopDistances,
        totalDistance: Number(totalDistance.toFixed(2)),
      };
    },
    []
  );

  return {
    distances,
    isCalculating,
    error,
    calculateStopDistances,
    getDistancePayload,
  };
};
