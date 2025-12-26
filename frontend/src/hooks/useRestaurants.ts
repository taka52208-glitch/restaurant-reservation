import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantsApi } from '../api';
import type { Seat } from '../types';

interface UpdateRestaurantData {
  name?: string;
  description?: string;
  genre?: string;
  area?: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: string;
  closing_days?: string;
  image_url?: string;
}

export function useRestaurants(params?: { genre?: string; area?: string }) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => restaurantsApi.getList(params),
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantsApi.getById(id),
    enabled: !!id,
  });
}

export function useMyStore() {
  return useQuery({
    queryKey: ['myStore'],
    queryFn: () => restaurantsApi.getMyStore(),
    retry: false,
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restaurantsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStore'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantData }) =>
      restaurantsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myStore'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useAddSeat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, seat }: { restaurantId: string; seat: Omit<Seat, 'id'> }) =>
      restaurantsApi.addSeat(restaurantId, seat),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['myStore'] });
    },
  });
}

export function useDeleteSeat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, seatId }: { restaurantId: string; seatId: string }) =>
      restaurantsApi.deleteSeat(restaurantId, seatId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['myStore'] });
    },
  });
}
