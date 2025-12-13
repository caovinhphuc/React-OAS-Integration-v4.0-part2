// src/services/maps/mapsService.ts
import { Loader } from '@googlemaps/js-api-loader';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  status: string;
}

export interface RouteOptimizationResult {
  optimizedOrder: string[];
  totalDistance: number;
  totalDuration: number;
  routes: google.maps.DirectionsRoute[];
}

export class GoogleMapsService {
  private loader: Loader;
  private isLoaded = false;

  constructor() {
    this.loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }

  async initialize() {
    if (this.isLoaded) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
      | string
      | undefined;
    if (!apiKey) {
      console.warn(
        'Google Maps: thiếu VITE_GOOGLE_MAPS_API_KEY, sẽ bỏ qua các tính năng bản đồ.'
      );
      this.isLoaded = true;
      return;
    }
    await this.loader.load();
    this.isLoaded = true;
  }

  async geocodeAddress(address: string): Promise<Coordinates | null> {
    await this.initialize();
    // Nếu không có Google Maps SDK, trả null để UI xử lý gracefully
    if (typeof window === 'undefined' || typeof google === 'undefined') {
      return null;
    }
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }

  async calculateDistance(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<DistanceResult | null> {
    await this.initialize();
    if (typeof window === 'undefined' || typeof google === 'undefined') {
      return null;
    }

    const service = new google.maps.DistanceMatrixService();

    return new Promise((resolve) => {
      service.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(origin.lat, origin.lng)],
          destinations: [
            new google.maps.LatLng(destination.lat, destination.lng),
          ],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status === 'OK' && response?.rows[0]?.elements[0]) {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              resolve({
                distance: element.distance!.value / 1000, // Convert to km
                duration: element.duration!.value / 60, // Convert to minutes
                status: element.status,
              });
            } else {
              resolve(null);
            }
          } else {
            console.error('Distance calculation failed:', status);
            resolve(null);
          }
        }
      );
    });
  }

  async optimizeRoute(
    waypoints: Coordinates[]
  ): Promise<RouteOptimizationResult | null> {
    await this.initialize();
    if (typeof window === 'undefined' || typeof google === 'undefined') {
      return null;
    }

    if (waypoints.length < 2) {
      throw new Error('Route optimization requires at least 2 waypoints');
    }

    const directionsService = new google.maps.DirectionsService();
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const intermediateWaypoints = waypoints.slice(1, -1).map((point) => ({
      location: new google.maps.LatLng(point.lat, point.lng),
      stopover: true,
    }));

    return new Promise((resolve) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          waypoints: intermediateWaypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === 'OK' && response) {
            const route = response.routes[0];
            let totalDistance = 0;
            let totalDuration = 0;

            route.legs.forEach((leg) => {
              totalDistance += leg.distance?.value || 0;
              totalDuration += leg.duration?.value || 0;
            });

            const optimizedOrder = response.routes[0].waypoint_order || [];

            resolve({
              optimizedOrder: optimizedOrder.map(String),
              totalDistance: totalDistance / 1000, // Convert to km
              totalDuration: totalDuration / 60, // Convert to minutes
              routes: response.routes,
            });
          } else {
            console.error('Route optimization failed:', status);
            resolve(null);
          }
        }
      );
    });
  }

  async searchPlaces(
    query: string,
    location?: Coordinates
  ): Promise<google.maps.places.PlaceResult[]> {
    await this.initialize();
    if (typeof window === 'undefined' || typeof google === 'undefined') {
      return [];
    }

    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    return new Promise((resolve) => {
      const request: google.maps.places.TextSearchRequest = {
        query,
        ...(location && {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 50000, // 50km radius
        }),
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          console.error('Places search failed:', status);
          resolve([]);
        }
      });
    });
  }
}
