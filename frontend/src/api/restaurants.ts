import type { Restaurant, Seat } from '../types';
import { apiClient } from './client';

interface RestaurantListParams {
  genre?: string;
  area?: string;
  skip?: number;
  limit?: number;
}

interface CreateRestaurantRequest {
  name: string;
  description?: string;
  genre: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  closing_days?: string;
  image_url?: string;
}

interface CreateSeatRequest {
  name: string;
  capacity: number;
}

interface AvailabilityParams {
  date: string;
  time: string;
  party_size: number;
}

interface AvailabilityResponse {
  available: boolean;
  restaurant_id: string;
  date: string;
  time: string;
  party_size: number;
  message: string | null;
}

interface StoreSalesParams {
  date_from?: string;
  date_to?: string;
}

interface StoreSalesResponse {
  restaurant_id: string;
  restaurant_name: string;
  total_sales: number;
  total_reservations: number;
  completed_reservations: number;
  cancelled_reservations: number;
  period: {
    from: string;
    to: string;
  };
}

export const restaurantsApi = {
  getList: async (params?: RestaurantListParams): Promise<Restaurant[]> => {
    const { data } = await apiClient.get<Restaurant[]>('/restaurants', { params });
    return data;
  },

  getById: async (id: string): Promise<Restaurant> => {
    const { data } = await apiClient.get<Restaurant>(`/restaurants/${id}`);
    return data;
  },

  getMyStore: async (): Promise<Restaurant> => {
    const { data } = await apiClient.get<Restaurant>('/restaurants/my/store');
    return data;
  },

  create: async (restaurant: CreateRestaurantRequest): Promise<Restaurant> => {
    const { data } = await apiClient.post<Restaurant>('/restaurants', restaurant);
    return data;
  },

  update: async (id: string, restaurant: Partial<CreateRestaurantRequest>): Promise<Restaurant> => {
    const { data } = await apiClient.put<Restaurant>(`/restaurants/${id}`, restaurant);
    return data;
  },

  addSeat: async (restaurantId: string, seat: CreateSeatRequest): Promise<Seat> => {
    const { data } = await apiClient.post<Seat>(`/restaurants/${restaurantId}/seats`, seat);
    return data;
  },

  deleteSeat: async (restaurantId: string, seatId: string): Promise<void> => {
    await apiClient.delete(`/restaurants/${restaurantId}/seats/${seatId}`);
  },

  getAvailability: async (restaurantId: string, params: AvailabilityParams): Promise<AvailabilityResponse> => {
    const { data } = await apiClient.get<AvailabilityResponse>(`/restaurants/${restaurantId}/availability`, { params });
    return data;
  },

  getStoreSales: async (restaurantId: string, params?: StoreSalesParams): Promise<StoreSalesResponse> => {
    const { data } = await apiClient.get<StoreSalesResponse>(`/restaurants/${restaurantId}/sales`, { params });
    return data;
  },
};
