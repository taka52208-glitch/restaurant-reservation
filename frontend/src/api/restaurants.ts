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
};
