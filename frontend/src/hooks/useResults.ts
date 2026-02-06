import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultsApi } from '../services/api';

export function useResults(workoutId: string) {
  return useQuery({
    queryKey: ['results', workoutId],
    queryFn: () => resultsApi.getByWorkout(workoutId),
    enabled: !!workoutId,
  });
}

export function useCreateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resultsApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['results', variables.workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useUpdateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resultToken, data }: {
      id: string;
      resultToken: string;
      data: {
        athleteName?: string;
        gender?: 'M' | 'F';
        resultValue?: string;
      };
    }) => resultsApi.update(id, resultToken, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['results', result.workoutId] });
    },
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resultToken }: { id: string; resultToken: string; workoutId: string }) =>
      resultsApi.delete(id, resultToken),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['results', variables.workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
