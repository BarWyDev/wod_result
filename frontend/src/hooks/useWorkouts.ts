import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi } from '../services/api';
import type { DateFilter } from '../types';

export function useWorkouts(dateFilter: DateFilter) {
  return useQuery({
    queryKey: ['workouts', dateFilter],
    queryFn: () => workoutsApi.getAll(dateFilter === 'all' ? undefined : dateFilter),
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => workoutsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workoutsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ownerToken }: { id: string; ownerToken: string }) =>
      workoutsApi.delete(id, ownerToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
