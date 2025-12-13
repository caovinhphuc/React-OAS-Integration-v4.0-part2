// src/features/maps/hooks/useMaps.ts
import { Coordinates, GoogleMapsService } from '@/services/maps/mapsService';
import { useMutation } from '@tanstack/react-query';

const mapsService = new GoogleMapsService();

export function useGeocoding() {
  return useMutation({
    mutationFn: (address: string) => mapsService.geocodeAddress(address),
  });
}

export function useDistanceCalculation() {
  return useMutation({
    mutationFn: ({ origin, destination }: { origin: Coordinates; destination: Coordinates }) =>
      mapsService.calculateDistance(origin, destination),
  });
}

export function useRouteOptimization() {
  return useMutation({
    mutationFn: (waypoints: Coordinates[]) => mapsService.optimizeRoute(waypoints),
  });
}

export function usePlacesSearch() {
  return useMutation({
    mutationFn: ({ query, location }: { query: string; location?: Coordinates }) =>
      mapsService.searchPlaces(query, location),
  });
}