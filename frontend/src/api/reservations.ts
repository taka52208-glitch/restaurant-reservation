import type { Reservation } from '../types';
import { apiClient } from './client';

interface CreateReservationRequest {
  restaurant_id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  payment_method: 'online' | 'onsite';
  amount: number;
  notes?: string;
}

interface StoreReservationsParams {
  date_filter?: string;
  status_filter?: string;
  skip?: number;
  limit?: number;
}

export const reservationsApi = {
  // Customer endpoints
  getMyReservations: async (): Promise<Reservation[]> => {
    const { data } = await apiClient.get<Reservation[]>('/reservations/my');
    return data;
  },

  create: async (reservation: CreateReservationRequest): Promise<Reservation> => {
    const { data } = await apiClient.post<Reservation>('/reservations', reservation);
    return data;
  },

  cancel: async (id: string): Promise<Reservation> => {
    const { data } = await apiClient.put<Reservation>(`/reservations/${id}/cancel`);
    return data;
  },

  // Store endpoints
  getStoreReservations: async (params?: StoreReservationsParams): Promise<Reservation[]> => {
    const { data } = await apiClient.get<Reservation[]>('/reservations/store/list', { params });
    return data;
  },

  complete: async (id: string): Promise<Reservation> => {
    const { data } = await apiClient.put<Reservation>(`/reservations/store/${id}/complete`);
    return data;
  },
};
