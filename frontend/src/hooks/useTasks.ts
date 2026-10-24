import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Task, TaskComment, User } from '../types';

const taskQueryKey = ['tasks'];

export const taskApi = {
  getAll: async (params?: Record<string, string | undefined>) => {
    const { data } = await api.get<{ success: boolean; data: Task[] }>('/tasks', { params });
    return data.data;
  },
  create: async (payload: Partial<Task>) => {
    const { data } = await api.post<{ success: boolean; data: Task }>('/tasks', payload);
    return data.data;
  },
  update: async ({ id, ...payload }: { id: string; [key: string]: unknown }) => {
    const { data } = await api.put<{ success: boolean; data: Task }>(`/tasks/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return data;
  },
  getComments: async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: TaskComment[] }>(`/tasks/${id}/comments`);
    return data.data;
  },
  addComment: async ({ id, message }: { id: string; message: string }) => {
    const { data } = await api.post<{ success: boolean; data: TaskComment }>(`/tasks/${id}/comments`, { message });
    return data.data;
  },
  getUsers: async () => {
    const { data } = await api.get<{ success: boolean; data: User[] }>('/users');
    return data.data;
  },
};

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: taskApi.getUsers,
    enabled: enabled && !!localStorage.getItem('taskToken'),
  });
}

export function useTasks(params?: Record<string, string | undefined>) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: [...taskQueryKey, params],
    queryFn: () => taskApi.getAll(params),
    enabled: !!localStorage.getItem('taskToken'),
  });

  const createMutation = useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskQueryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: taskApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskQueryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: taskApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskQueryKey }),
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
