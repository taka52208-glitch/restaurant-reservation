import type { Restaurant } from '../types';
import { apiClient } from './client';

interface SalesSummary {
  total_sales: number;
  total_reservations: number;
  active_restaurants: number;
  average_per_restaurant: number;
}

interface RestaurantSales {
  id: string;
  name: string;
  reservations: number;
  sales: number;
}

interface SalesParams {
  date_from?: string;
  date_to?: string;
}

export const adminApi = {
  getRestaurants: async (statusFilter?: string): Promise<Restaurant[]> => {
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const { data } = await apiClient.get<Restaurant[]>('/admin/restaurants', { params });
    return data;
  },

  approveRestaurant: async (id: string): Promise<Restaurant> => {
    const { data } = await apiClient.put<Restaurant>(`/admin/restaurants/${id}/approve`);
    return data;
  },

  suspendRestaurant: async (id: string): Promise<Restaurant> => {
    const { data } = await apiClient.put<Restaurant>(`/admin/restaurants/${id}/suspend`);
    return data;
  },

  getSalesSummary: async (params?: SalesParams): Promise<SalesSummary> => {
    const { data } = await apiClient.get<SalesSummary>('/admin/sales/summary', { params });
    return data;
  },

  getSalesByRestaurant: async (params?: SalesParams & { limit?: number }): Promise<RestaurantSales[]> => {
    const { data } = await apiClient.get<RestaurantSales[]>('/admin/sales/by-restaurant', { params });
    return data;
  },
};
