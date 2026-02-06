import axios from 'axios';
import type { Workout, Result, WorkoutType } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Workouts API
export const workoutsApi = {
  getAll: async (dateFilter?: string) => {
    const params = dateFilter ? { dateFilter } : {};
    const { data } = await api.get<{ workouts: Workout[] }>('/workouts', { params });
    return data.workouts;
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ workout: Workout }>(`/workouts/${id}`);
    return data.workout;
  },

  create: async (workout: {
    description: string;
    workoutDate?: string;
    sortDirection?: 'asc' | 'desc';
    workoutType?: WorkoutType;
  }) => {
    const { data } = await api.post<{ workout: Workout; ownerToken: string }>('/workouts', workout);
    return data;
  },

  delete: async (id: string, ownerToken: string) => {
    await api.delete(`/workouts/${id}`, { data: { ownerToken } });
  },
};

// Results API
export const resultsApi = {
  getByWorkout: async (workoutId: string) => {
    const { data } = await api.get<{ results: Result[] }>(`/results/${workoutId}`);
    return data.results;
  },

  create: async (result: {
    workoutId: string;
    athleteName: string;
    gender: 'M' | 'F';
    resultValue: string;
  }) => {
    const { data } = await api.post<{ result: Result; resultToken: string }>('/results', result);
    return data;
  },

  update: async (
    id: string,
    resultToken: string,
    data: {
      athleteName?: string;
      gender?: 'M' | 'F';
      resultValue?: string;
    }
  ) => {
    const response = await api.put<{ result: Result }>(`/results/${id}`, {
      resultToken,
      ...data,
    });
    return response.data.result;
  },

  delete: async (id: string, resultToken: string) => {
    await api.delete(`/results/${id}`, { data: { resultToken } });
  },
};
