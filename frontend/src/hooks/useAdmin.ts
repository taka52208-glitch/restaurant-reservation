import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api';

export function useAdminRestaurants(statusFilter?: string) {
  return useQuery({
    queryKey: ['adminRestaurants', statusFilter],
    queryFn: () => adminApi.getRestaurants(statusFilter),
  });
}

export function useApproveRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.approveRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
    },
  });
}

export function useSuspendRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.suspendRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
    },
  });
}

export function useSalesSummary(params?: { date_from?: string; date_to?: string }) {
  return useQuery({
    queryKey: ['salesSummary', params],
    queryFn: () => adminApi.getSalesSummary(params),
  });
}

export function useSalesByRestaurant(params?: {
  date_from?: string;
  date_to?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['salesByRestaurant', params],
    queryFn: () => adminApi.getSalesByRestaurant(params),
  });
}
