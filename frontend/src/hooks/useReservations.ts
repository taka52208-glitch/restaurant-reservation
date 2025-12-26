import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../api';

export function useMyReservations() {
  return useQuery({
    queryKey: ['myReservations'],
    queryFn: () => reservationsApi.getMyReservations(),
  });
}

export function useStoreReservations(params?: {
  date_filter?: string;
  status_filter?: string;
}) {
  return useQuery({
    queryKey: ['storeReservations', params],
    queryFn: () => reservationsApi.getStoreReservations(params),
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
  });
}

export function useCompleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeReservations'] });
    },
  });
}
