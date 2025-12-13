// src/features/orders/hooks/useOrders.ts
import { CarriersService } from '@/services/googleSheets/carriersService';
import { Order, OrdersService } from '@/services/googleSheets/ordersService';
import { GoogleMapsService } from '@/services/maps/mapsService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const ordersService = new OrdersService();
const mapsService = new GoogleMapsService();
const carriersService = new CarriersService();

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersService.getOrders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOrderById(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersService.getOrderById(orderId),
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>) => {
      // Geocode addresses
      const pickupCoords = await mapsService.geocodeAddress(orderData.pickupAddress);
      const deliveryCoords = await mapsService.geocodeAddress(orderData.deliveryAddress);

      // Calculate distance if coordinates available
      let distance = 0;
      let estimatedDuration = 0;
      if (pickupCoords && deliveryCoords) {
        const distanceResult = await mapsService.calculateDistance(pickupCoords, deliveryCoords);
        if (distanceResult) {
          distance = distanceResult.distance;
          estimatedDuration = distanceResult.duration;
        }
      }

      // Calculate estimated cost if carrier selected
      let estimatedCost = 0;
      if (orderData.carrierId) {
        const carrier = await carriersService.getCarrierById(orderData.carrierId);
        if (carrier) {
          estimatedCost = carriersService.calculateShippingCost(
            carrier,
            distance,
            orderData.totalVolume,
            orderData.totalWeight
          );
        }
      }

      const enrichedOrderData = {
        ...orderData,
        pickupCoordinates: pickupCoords ? `${pickupCoords.lat},${pickupCoords.lng}` : '',
        deliveryCoordinates: deliveryCoords ? `${deliveryCoords.lat},${deliveryCoords.lng}` : '',
        distance,
        estimatedDuration,
        estimatedCost,
      };

      return ordersService.createOrder(enrichedOrderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) =>
      ordersService.updateOrder(orderId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersService.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}