import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { AuthResponse, User } from '../types';

const tokenKey = 'taskToken';
const authUserKey = 'auth-user';

const getStoredToken = () => localStorage.getItem(tokenKey);

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', payload);
    return data.data;
  },
  register: async (payload: { name: string; email: string; password: string }) => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', payload);
    return data.data;
  },
  me: async () => {
    const { data } = await api.get<{ success: boolean; data: User }>('/auth/me');
    return data.data;
  },
};

export function useAuth() {
  const queryClient = useQueryClient();

  const token = getStoredToken();

  const userQuery = useQuery({
    queryKey: [authUserKey],
    queryFn: authApi.me,
    enabled: Boolean(token),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem(tokenKey, data.token);
      queryClient.setQueryData([authUserKey], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem(tokenKey, data.token);
      queryClient.setQueryData([authUserKey], data.user);
    },
  });

  const logout = () => {
    localStorage.removeItem(tokenKey);
    queryClient.setQueryData([authUserKey], null);
    queryClient.clear();
  };

  return {
    token,
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    loginMutation,
    registerMutation,
    logout,
  };
}
